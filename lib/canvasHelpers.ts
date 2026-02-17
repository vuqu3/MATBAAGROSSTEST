/**
 * Design canvas helpers: photo holders (clipping masks), lock state, etc.
 */
import type { Canvas } from 'fabric';
import { Group, Rect, FabricText, FabricImage } from 'fabric';

const PHOTO_HOLDER_PLACEHOLDER = 'Fotoğrafınızı Buraya Sürükleyin';
const PHOTO_HOLDER_WIDTH = 200;
const PHOTO_HOLDER_HEIGHT = 140;

export function isPhotoHolder(obj: unknown): boolean {
  const o = obj as { get?: (key: string) => unknown };
  return o?.get?.('isPhotoHolder') === true;
}

export function isLocked(obj: unknown): boolean {
  const o = obj as { selectable?: boolean; evented?: boolean };
  return o?.selectable === false || o?.evented === false;
}

/** Create a photo holder group (gray rect + placeholder text) and add it to the canvas. */
export function createPhotoHolder(canvas: Canvas, centerX: number, centerY: number) {
  const left = centerX - PHOTO_HOLDER_WIDTH / 2;
  const top = centerY - PHOTO_HOLDER_HEIGHT / 2;

  const bg = new Rect({
    left: -PHOTO_HOLDER_WIDTH / 2,
    top: -PHOTO_HOLDER_HEIGHT / 2,
    width: PHOTO_HOLDER_WIDTH,
    height: PHOTO_HOLDER_HEIGHT,
    fill: '#e2e8f0',
    stroke: '#94a3b8',
    strokeWidth: 1,
    originX: 'left',
    originY: 'top',
  });

  const label = new FabricText(PHOTO_HOLDER_PLACEHOLDER, {
    left: 0,
    top: 0,
    originX: 'center',
    originY: 'center',
    fontFamily: 'Arial',
    fontSize: 12,
    fill: '#64748b',
    textAlign: 'center',
  });

  const group = new Group([bg, label], {
    left: left + PHOTO_HOLDER_WIDTH / 2,
    top: top + PHOTO_HOLDER_HEIGHT / 2,
    originX: 'center',
    originY: 'center',
    lockRotation: true,
  });
  group.set('isPhotoHolder', true);

  canvas.add(group);
  canvas.setActiveObject(group);
  canvas.requestRenderAll();
  return group;
}

/**
 * If the active object is a photo holder, replace it with a group containing the image
 * clipped to the holder's bounds. Otherwise returns false.
 */
export function replacePhotoHolderWithImage(
  canvas: Canvas,
  img: FabricImage
): boolean {
  const active = canvas.getActiveObject();
  if (!active || !isPhotoHolder(active)) return false;

  const group = active as Group;
  const bounds = group.getBoundingRect(true);
  const w = bounds.width;
  const h = bounds.height;
  const centerLeft = bounds.left + bounds.width / 2;
  const centerTop = bounds.top + bounds.height / 2;

  const clipRect = new Rect({
    left: -w / 2,
    top: -h / 2,
    width: w,
    height: h,
    originX: 'left',
    originY: 'top',
  });

  const imgW = img.width ?? 1;
  const imgH = img.height ?? 1;
  const scale = Math.max(w / imgW, h / imgH);
  img.set({
    scaleX: scale,
    scaleY: scale,
    left: 0,
    top: 0,
    originX: 'center',
    originY: 'center',
  });

  const newGroup = new Group([img], {
    left: centerLeft,
    top: centerTop,
    originX: 'center',
    originY: 'center',
    lockRotation: true,
  });
  newGroup.clipPath = clipRect;
  newGroup.set('isPhotoHolder', true);
  newGroup.set('hasImage', true);

  canvas.remove(group);
  canvas.add(newGroup);
  canvas.setActiveObject(newGroup);
  canvas.requestRenderAll();
  return true;
}
