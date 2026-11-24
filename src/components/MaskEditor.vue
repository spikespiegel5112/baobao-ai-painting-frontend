<template>
  <div class="maskrditor_container">
    <div class="operation">
      <a-button
        size="small"
        :type="tool === 'ellipse' ? 'primary' : 'default'"
        @click="tool = 'ellipse'"
      >
        椭圆
      </a-button>
      <a-button
        size="small"
        :type="tool === 'rect' ? 'primary' : 'default'"
        @click="tool = 'rect'"
      >
        矩形
      </a-button>
      <a-button
        class="deletemask"
        size="small"
        danger
        :disabled="selectedId == null"
        @click="removeSelected"
      >
        删除当前Mask
      </a-button>
      <a-button
        class="clearmask"
        size="small"
        danger
        :disabled="masks.length === 0"
        @click="removeAll"
      >
        清空
      </a-button>
      <a-button
        class="previewmask"
        size="small"
        :disabled="masks.length === 0"
        @click="previewMask"
      >
        预览Mask
      </a-button>
    </div>
    <div
      class="main"
      tabindex="0"
      @keydown="onKeyDown"
    >
      <div
        ref="stageRef"
        class="stage"
      >
        <img
          v-show="state.imageSrc !== ''"
          ref="imgRef"
          :src="global.$getFileBaseUrl() + '/' + state.imageSrc"
          alt="原图"
          @load="onImageLoad"
        />
        <canvas
          ref="canvasRef"
          @mousedown="onMouseDown"
          @mousemove="onCanvasMove"
          @mouseup="onMouseUp"
          @mouseleave="onMouseUp"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch, getCurrentInstance, type ComponentInternalInstance } from 'vue';

type Shape = 'ellipse' | 'rect';
type MaskItem = {
  id: number;
  shape: Shape;
  cx: number;
  cy: number;
  rx: number;
  ry: number;
};
type DragMode = 'create' | 'move' | 'resize' | null;
type Handle = 'nw' | 'ne' | 'sw' | 'se';

const currentInstance = getCurrentInstance() as ComponentInternalInstance;
const global = currentInstance.appContext.config.globalProperties as any;

const props = defineProps({
  imageSrc: { type: String, default: '', required: true },
});

const emit = defineEmits<{
  change: [
    payload: {
      maskBase64: string;
      naturalWidth: number;
      naturalHeight: number;
      displayWidth: number;
      displayHeight: number;
      scale: number;
      aspectRatio: number;
      masks: MaskItem[];
    },
  ];
}>();

const state = reactive({ imageSrc: '' });
const layout = reactive({
  naturalWidth: 0,
  naturalHeight: 0,
  displayWidth: 0,
  displayHeight: 0,
  scale: 1,
});

const imgRef = ref<HTMLImageElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);
const stageRef = ref<HTMLDivElement | null>(null);

let ctx: CanvasRenderingContext2D | null = null;
let nextId = 1;

const tool = ref<Shape>('ellipse');
const masks = ref<MaskItem[]>([]);
const selectedId = ref<number | null>(null);

let mode: DragMode = null;
let handle: Handle | null = null;
let startPt = { x: 0, y: 0 };
let origin: MaskItem | null = null;

const HANDLE_SCREEN = 14;
const HIT_SCREEN = 22;
const handlePx = () => HANDLE_SCREEN / Math.max(layout.scale, 0.001);
const hitPx = () => HIT_SCREEN / Math.max(layout.scale, 0.001);

const onImageLoad = () => {
  const img = imgRef.value!;
  const canvas = canvasRef.value!;
  const stage = stageRef.value!;
  const nw = img.naturalWidth || img.width;
  const nh = img.naturalHeight || img.height;
  canvas.width = nw;
  canvas.height = nh;
  ctx = canvas.getContext('2d');

  const boxW = stage.parentElement!.clientWidth;
  const boxH = stage.parentElement!.clientHeight;
  const scale = Math.min(boxW / nw, boxH / nh);
  const w = nw * scale;
  const h = nh * scale;

  layout.naturalWidth = nw;
  layout.naturalHeight = nh;
  layout.displayWidth = w;
  layout.displayHeight = h;
  layout.scale = scale;

  stage.style.width = `${w}px`;
  stage.style.height = `${h}px`;
  img.style.width = '100%';
  img.style.height = '100%';
  canvas.style.width = '100%';
  canvas.style.height = '100%';

  masks.value = [];
  selectedId.value = null;
  redraw();
  emitMask();
};

const canvasPoint = (e: MouseEvent) => {
  const canvas = canvasRef.value!;
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((e.clientX - rect.left) * canvas.width) / rect.width,
    y: ((e.clientY - rect.top) * canvas.height) / rect.height,
  };
};

const drawShape = (c: CanvasRenderingContext2D, m: MaskItem, fill: string) => {
  c.beginPath();
  if (m.shape === 'ellipse') {
    c.ellipse(m.cx, m.cy, m.rx, m.ry, 0, 0, Math.PI * 2);
  } else {
    c.rect(m.cx - m.rx, m.cy - m.ry, m.rx * 2, m.ry * 2);
  }
  c.fillStyle = fill;
  c.fill();
};

const hitHandle = (m: MaskItem, x: number, y: number): Handle | null => {
  const r = hitPx();
  const pts: Record<Handle, [number, number]> = {
    nw: [m.cx - m.rx, m.cy - m.ry],
    ne: [m.cx + m.rx, m.cy - m.ry],
    sw: [m.cx - m.rx, m.cy + m.ry],
    se: [m.cx + m.rx, m.cy + m.ry],
  };
  for (const k of Object.keys(pts) as Handle[]) {
    const [hx, hy] = pts[k];
    if (Math.hypot(x - hx, y - hy) <= r) return k;
  }
  return null;
};

const hitMask = (x: number, y: number) => {
  for (let i = masks.value.length - 1; i >= 0; i--) {
    const m = masks.value[i];
    if (m.shape === 'ellipse') {
      const nx = (x - m.cx) / Math.max(m.rx, 1e-6);
      const ny = (y - m.cy) / Math.max(m.ry, 1e-6);
      if (nx * nx + ny * ny <= 1) return m;
    } else if (Math.abs(x - m.cx) <= m.rx && Math.abs(y - m.cy) <= m.ry) {
      return m;
    }
  }
  return null;
};

const redraw = () => {
  const canvas = canvasRef.value;
  if (!ctx || !canvas) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const m of masks.value) {
    drawShape(ctx, m, 'rgba(255,255,255,0.85)');
    if (m.id === selectedId.value) {
      ctx.beginPath();
      if (m.shape === 'ellipse') {
        ctx.ellipse(m.cx, m.cy, m.rx, m.ry, 0, 0, Math.PI * 2);
      } else {
        ctx.rect(m.cx - m.rx, m.cy - m.ry, m.rx * 2, m.ry * 2);
      }
      ctx.strokeStyle = '#1677ff';
      ctx.lineWidth = 2 / Math.max(layout.scale, 0.001);
      ctx.stroke();

      const s = handlePx();
      const corners: [number, number][] = [
        [m.cx - m.rx, m.cy - m.ry],
        [m.cx + m.rx, m.cy - m.ry],
        [m.cx - m.rx, m.cy + m.ry],
        [m.cx + m.rx, m.cy + m.ry],
      ];
      for (const [hx, hy] of corners) {
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#1677ff';
        ctx.lineWidth = 2 / Math.max(layout.scale, 0.001);
        ctx.beginPath();
        ctx.rect(hx - s / 2, hy - s / 2, s, s);
        ctx.fill();
        ctx.stroke();
      }
    }
  }
};

const buildMaskCanvas = () => {
  const canvas = canvasRef.value;
  if (!canvas) return null;
  const off = document.createElement('canvas');
  off.width = canvas.width;
  off.height = canvas.height;
  const octx = off.getContext('2d')!;
  octx.fillStyle = 'black';
  octx.fillRect(0, 0, off.width, off.height);
  for (const m of masks.value) {
    drawShape(octx, m, 'white');
  }
  return off;
};

const emitMask = () => {
  const off = buildMaskCanvas();
  if (!off) return;
  emit('change', {
    maskBase64: off.toDataURL('image/png'),
    naturalWidth: layout.naturalWidth,
    naturalHeight: layout.naturalHeight,
    displayWidth: layout.displayWidth,
    displayHeight: layout.displayHeight,
    scale: layout.scale,
    aspectRatio: layout.naturalWidth / Math.max(layout.naturalHeight, 1),
    masks: masks.value.map((m) => ({ ...m })),
  });
};

const onMouseDown = (e: MouseEvent) => {
  if (!ctx) return;
  const p = canvasPoint(e);
  startPt = p;

  const sel = masks.value.find((m) => m.id === selectedId.value);
  if (sel) {
    const h = hitHandle(sel, p.x, p.y);
    if (h) {
      mode = 'resize';
      handle = h;
      origin = { ...sel };
      return;
    }
  }

  const hit = hitMask(p.x, p.y);
  if (hit) {
    selectedId.value = hit.id;
    mode = 'move';
    origin = { ...hit };
    redraw();
    return;
  }

  const id = nextId++;
  const item: MaskItem = {
    id,
    shape: tool.value,
    cx: p.x,
    cy: p.y,
    rx: 1,
    ry: 1,
  };
  masks.value.push(item);
  selectedId.value = id;
  mode = 'create';
  origin = { ...item };
  redraw();
};

const onMouseMove = (e: MouseEvent) => {
  if (!mode || !origin) return;
  const p = canvasPoint(e);
  const m = masks.value.find((x) => x.id === origin!.id);
  if (!m) return;

  if (mode === 'create') {
    m.cx = (origin.cx + p.x) / 2;
    m.cy = (origin.cy + p.y) / 2;
    m.rx = Math.abs(p.x - origin.cx) / 2;
    m.ry = Math.abs(p.y - origin.cy) / 2;
  } else if (mode === 'move') {
    m.cx = origin.cx + (p.x - startPt.x);
    m.cy = origin.cy + (p.y - startPt.y);
  } else if (mode === 'resize' && handle) {
    let left = origin.cx - origin.rx;
    let right = origin.cx + origin.rx;
    let top = origin.cy - origin.ry;
    let bottom = origin.cy + origin.ry;
    if (handle.includes('w')) left = p.x;
    if (handle.includes('e')) right = p.x;
    if (handle.includes('n')) top = p.y;
    if (handle.includes('s')) bottom = p.y;
    m.cx = (left + right) / 2;
    m.cy = (top + bottom) / 2;
    m.rx = Math.max(2, Math.abs(right - left) / 2);
    m.ry = Math.max(2, Math.abs(bottom - top) / 2);
  }
  redraw();
};

const onHoverCursor = (e: MouseEvent) => {
  if (mode || !canvasRef.value) return;
  const p = canvasPoint(e);
  const sel = masks.value.find((m) => m.id === selectedId.value);
  if (sel && hitHandle(sel, p.x, p.y)) {
    const h = hitHandle(sel, p.x, p.y);
    canvasRef.value.style.cursor = h === 'ne' || h === 'sw' ? 'nesw-resize' : 'nwse-resize';
    return;
  }
  canvasRef.value.style.cursor = hitMask(p.x, p.y) ? 'move' : 'crosshair';
};

const onCanvasMove = (e: MouseEvent) => {
  if (mode) onMouseMove(e);
  else onHoverCursor(e);
};

const onMouseUp = () => {
  if (!mode) return;
  mode = null;
  handle = null;
  origin = null;
  redraw();
  emitMask();
};

const removeSelected = () => {
  if (selectedId.value == null) return;
  masks.value = masks.value.filter((m) => m.id !== selectedId.value);
  selectedId.value = null;
  redraw();
  emitMask();
};

const removeAll = () => {
  masks.value = [];
  selectedId.value = null;
  redraw();
  emitMask();
};

const previewMask = () => {
  const off = buildMaskCanvas();
  if (!off) return;
  const url = off.toDataURL('image/png');
  const win = window.open();
  if (win) {
    win.document.write(
      `<title>mask preview</title><img src="${url}" style="max-width:100%;background:#111"/>`
    );
  }
};

const onKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Delete' || e.key === 'Backspace') {
    e.preventDefault();
    removeSelected();
  }
};

watch(
  () => props.imageSrc,
  (v) => {
    state.imageSrc = v;
  },
  { immediate: true }
);
</script>

<style scoped>
.maskrditor_container {
  width: 100%;
  min-height: 5rem;
  height: 12rem;
  position: relative;
}
.operation {
  position: relative;
  z-index: 2;
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-bottom: 0.25rem;
}
.main {
  width: 100%;
  height: calc(100% - 1.5rem);
  position: relative;
  border: 1px solid #333;
  outline: none;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.stage {
  position: relative;
  flex-shrink: 0;
}
.stage img,
.stage canvas {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: fill;
}
.stage img {
  pointer-events: none;
  user-select: none;
  -webkit-user-drag: none;
}
.stage canvas {
  cursor: crosshair;
  z-index: 1;
}
</style>
