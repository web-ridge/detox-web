import { by, device, element, expect } from './detox';

export async function replaceTextById(
  id: string,
  text: string,
  pressReturn?: boolean
) {
  const el = await element(by.id(id));
  await el.replaceText(text);

  if (pressReturn) {
    await el.tapReturnKey();
  }
}

export async function isVisibleByText(text: string) {
  const el = await element(by.text(text));
  return await expect(el).toBeVisible();
}

export async function isVisibleById(id: string) {
  const el = await element(by.id(id));
  return await expect(el).toBeVisible();
}

export async function tapById(id: string, options?: { x: number; y: number }) {
  const btn = await element(by.id(id));
  if (options) {
    await btn.tapAtPoint(options);
  } else {
    await btn.tap();
  }
}

export async function tapByText(text: string) {
  const btn = await element(by.text(text));
  await btn.tap();
}

export async function tapByLabel(label: string) {
  const btn = await element(by.label(label));
  await btn.tap();
}

export async function reset() {
  await device.launchApp({
    delete: true,
    newInstance: true,
    permissions: { camera: 'YES', microphone: 'YES', notifications: 'YES' },
  });
}
