import type { ElementHandle, Page } from 'puppeteer';
import 'expect-puppeteer';

interface WebMatcher {
  get(): { selector: string; xpath: string | undefined };
  and(by: WebMatcher): WebMatcher;
  withAncestor(parentBy: WebMatcher): WebMatcher;
  withDescendant(childBy: WebMatcher): WebMatcher;
}

let WebMatcherBuilder = function (
  startSelector: string,
  startXpath?: string
): WebMatcher {
  let selector = startSelector;
  let xpath = startXpath;
  return {
    and: function (by) {
      if (xpath) {
        console.error('and is not supported with by.text() on web');
      }
      selector = `${by}${selector}`;
      return this;
    },
    withAncestor: function (parentBy) {
      if (xpath) {
        console.error('and is not supported with by.text() on web');
      }
      selector = `${parentBy} ${selector}`;
      return this;
    },
    withDescendant: function (childBy) {
      if (xpath) {
        console.error('and is not supported with by.text() on web');
      }
      selector = `${selector} ${childBy}`;
      return this;
    },
    get: () => ({
      xpath,
      selector,
    }),
  };
};

interface WebBy {
  id(id: string): WebMatcher;
  text(text: string): WebMatcher;

  label(label: string): WebMatcher;
  type(nativeViewType: string): WebMatcher;
  traits(traits: string[]): WebMatcher;
}

const by: WebBy = {
  id: (id: string) => WebMatcherBuilder(`[data-testid='${id}']`),
  text: (text: string) => WebMatcherBuilder('', `//*[text() = "${text}"]`),
  label: (label: string) => WebMatcherBuilder(`[aria-label="${label}"]`),
  type: (type: string) => {
    notImplemented(`type(${type})`);
    return WebMatcherBuilder('');
  },
  traits: (traits: string[]) => {
    // TODO: improve
    return WebMatcherBuilder(`[aria-role="${traits[0]}"]`);
  },
};

let appLaunchArgs: Detox.DeviceLaunchAppConfig | undefined;

type WebDevice = Omit<
  Detox.Device,
  'getPlatform' | 'reverseTcpPort' | 'unreverseTcpPort'
> & {
  getPlatform: () => 'android' | 'ios' | 'web';
};

function notImplemented(funcName: string) {
  console.log(
    `${funcName} not supported on the web platform only on native devices`
  );
}

const device: WebDevice = {
  id: 'puppeteer',
  name: 'puppeteer',
  appLaunchArgs: {
    get: () => appLaunchArgs || {},
    reset: () => (appLaunchArgs = {}),
    modify: (args: object) => {
      appLaunchArgs = { ...appLaunchArgs, ...args };
    },
  },
  launchApp: async (arg) => {
    appLaunchArgs = arg;
    if (arg?.delete) {
      await page.evaluateOnNewDocument(() => {
        localStorage.clear();
      });
    }
    await page.goto('http://localhost:3000');
  },
  selectApp: async (name: string) => {
    notImplemented(`selectApp(${name})`);
  },
  terminateApp: async (bundle?: string) => {
    notImplemented(`terminateApp(${bundle || ''})`);
  },
  sendToHome: async () => {
    await page.goto('http://localhost:3000');
  },
  reloadReactNative: async () => {
    await page.goto('http://localhost:3000');
    await page.reload();
  },
  installApp: async (path?: any) => {
    notImplemented(`installApp(${path || ''})`);
  },
  uninstallApp: async (bundle?: string) => {
    await page.evaluateOnNewDocument(() => {
      localStorage.clear();
    });
    notImplemented(`uninstallApp(${bundle || ''})`);
  },
  openURL: async (params: { url: string; sourceApp?: string }) => {
    notImplemented(`openURL(${JSON.stringify(params)})`);
  },
  sendUserNotification: async (..._: any[]) => {
    notImplemented('sendUserNotification()');
  },
  sendUserActivity: async (..._: any[]) => {
    notImplemented('sendUserActivity()');
  },
  setOrientation: async (orientation: Detox.Orientation) => {
    notImplemented(`setOrientation(${orientation})`);
  },
  setLocation: async (latitude: number, longitude: number) => {
    const client = await page.target().createCDPSession();
    await client.send('Emulation.setGeolocationOverride', {
      accuracy: 100,
      latitude,
      longitude,
    });
  },

  setURLBlacklist: async (lists: string[]) => {
    notImplemented(`setURLBlacklist(${lists?.join(', ')})`);
  },
  enableSynchronization: async () => {
    notImplemented('enableSynchronization()');
  },
  disableSynchronization: async () => {
    notImplemented('disableSynchronization()');
  },
  resetContentAndSettings: async () => {
    await page.evaluateOnNewDocument(() => {
      localStorage.clear();
    });
  },
  getPlatform: () => {
    return 'web';
  },
  takeScreenshot: async (name: string) => {
    try {
      const path = name + '.png';
      await page.screenshot({
        path,
      });
      return path;
    } catch (e) {
      console.log('takeScreenshot error', e);
      return '';
    }
  },
  shake: async () => {
    notImplemented('shake()');
  },
  setBiometricEnrollment: async (_: boolean) => {
    notImplemented('setBiometricEnrollment()');
  },
  matchFace: async () => {
    notImplemented('matchFace()');
  },
  unmatchFace: async () => {
    notImplemented('unmatchFace()');
  },
  matchFinger: async () => {
    notImplemented('matchFinger()');
  },
  unmatchFinger: async () => {
    notImplemented('unmatchFinger()');
  },
  clearKeychain: async () => {
    notImplemented('clearKeychain()');
  },
  pressBack: async () => {
    await page.goBack();
  },
  getUiDevice: async () => {
    notImplemented('getUiDevice()');
  },
};

interface WebElementActions {
  core: ElementHandle;
  tap(): Promise<void>;
  longPress(): Promise<void>;
  longPressAndDrag(
    duration: number,
    normalizedPositionX: number,
    normalizedPositionY: number,
    targetElement: ElementHandle,
    normalizedTargetPositionX: number,
    normalizedTargetPositionY: number,
    speed: Detox.Speed,
    holdDuration: number
  ): Promise<void>;
  multiTap(times: number): Promise<void>;
  tapAtPoint(point: { x: number; y: number }): Promise<void>;
  typeText(text: string): Promise<void>;
  replaceText(text: string): Promise<void>;
  clearText(): Promise<void>;
  tapBackspaceKey(): Promise<void>;
  tapReturnKey(): Promise<void>;
  scroll(
    pixels: number,
    direction: Detox.Direction,
    startPositionX?: number,
    startPositionY?: number
  ): Promise<void>;
  scrollTo(edge: Detox.Direction): Promise<void>;
  swipe(
    direction: Detox.Direction,
    speed?: Detox.Speed,
    percentage?: number,
    normalizedStartingPointX?: number,
    normalizedStartingPointY?: number
  ): Promise<void>;
  setColumnToValue(column: number, value: string): Promise<void>;
  setDatePickerDate(dateString: string, dateFormat: string): Promise<void>;
  pinchWithAngle(
    direction: Detox.PinchDirection,
    speed: Detox.Speed,
    angle: number
  ): Promise<void>;
  pinch(scale: number, speed: Detox.Speed, angle: number): Promise<void>;
}

async function findElement(p: WebMatcher): Promise<ElementHandle> {
  const { selector, xpath } = p.get();
  const pa = await page;

  const result = xpath
    ? await pa.waitForXPath(xpath, {
        timeout: 2000,
      })!
    : await pa.waitForSelector(selector, {
        timeout: 2000,
      });

  return result!;
}
// async function findElementWithRetry(p: WebMatcher): Promise<ElementHandle> {
//   try {
//     return await findElement(p);
//   } catch (error) {
//     await sleep(1000);
//     return await findElement(p);
//   }
// }

const element: (p: WebMatcher) => Promise<WebElementActions> = async (
  p: WebMatcher
): Promise<WebElementActions> => {
  const { selector } = p.get();

  const e = await findElement(p);

  if (!e) {
    throw Error('element not found');
  }

  return {
    core: e,
    replaceText: async (v: string) => {
      await e.click({ clickCount: 3 });
      await e.type(v, { delay: 20 });
    },
    tapReturnKey: async () => {
      await page.keyboard.press('Enter');
    },
    tap: async () => {
      await e.click({ delay: 10 });
    },
    scroll: async (
      offset: number,
      direction: 'up' | 'down',
      startPositionX?: number,
      startPositionY?: number
    ) => {
      if (startPositionX || startPositionY) {
        notImplemented('scroll() with startPositionX and/or startPositionY');
      }

      await page.evaluate(
        (sel: string, dir: Detox.Direction, off: number) => {
          const scrollView = document.querySelector(sel);
          if (!scrollView) {
            throw Error('cannot scroll element');
          }

          switch (dir) {
            case 'up':
              scrollView.scrollBy(0, -off);
              break;
            case 'down':
              scrollView.scrollBy(0, off);
              break;
          }
        },
        selector,
        direction,
        offset
      );
    },
    clearText: async () => {
      await e.click({ clickCount: 3 });
      await e.type('');
    },
    longPress: async () => {
      await e.click({
        delay: 600,
      });
    },
    longPressAndDrag: async (
      duration: number,
      normalizedPositionX: number,
      normalizedPositionY: number,
      targetElement: ElementHandle,
      normalizedTargetPositionX: number,
      normalizedTargetPositionY: number,
      speed: Detox.Speed,
      holdDuration: number
    ) => {
      notImplemented('longPressAndDrag()');
      await e.click({
        delay: holdDuration,
      });
    },
    multiTap: async (times: number) => {
      await e.click({ clickCount: times });
    },
    pinch: async (scale: number, speed: Detox.Speed, angle: number) => {
      notImplemented(`pinch(${scale},${speed}, ${angle})`);
    },
    pinchWithAngle: async (
      direction: Detox.PinchDirection,
      speed: Detox.Speed,
      angle: number
    ) => {
      notImplemented(`pinch(${direction},${speed}, ${angle})`);
    },
    scrollTo: async (edge: Detox.Direction) => {
      await page.evaluate(
        (sel: string, edg: Detox.Direction) => {
          const scrollView = document.querySelector(sel);
          if (!scrollView) {
            throw Error('cannot scroll element');
          }

          switch (edg) {
            case 'bottom':
              scrollView.scrollTop = scrollView.scrollHeight;
              break;
            case 'left':
              scrollView.scrollLeft = 0;
              break;
            case 'right':
              scrollView.scrollLeft = scrollView.scrollWidth;
              break;
            case 'top':
              scrollView.scrollTop = 0;
              break;
          }
        },
        selector,
        edge
      );
    },
    setColumnToValue: async (column: number, value: string) => {
      notImplemented(`setColumnToValue(${column}, ${value})`);
    },
    setDatePickerDate: async (dateString: string, dateFormat: string) => {
      notImplemented(`setDatePickerDate(${dateString}, ${dateFormat})`);
    },
    swipe: async (
      direction: Detox.Direction,
      speed?: Detox.Speed,
      percentage?: number,
      normalizedStartingPointX?: number,
      normalizedStartingPointY?: number
    ) => {
      notImplemented(
        `swipe(${direction}, ${speed}, ${percentage}, ${normalizedStartingPointX}, ${normalizedStartingPointY})`
      );
    },
    tapAtPoint: async (point: { x: number; y: number }) => {
      const rect = await page.evaluate((el) => {
        const { x, y } = el.getBoundingClientRect();
        return { x, y };
      }, e);

      const offset = { x: point.x, y: point.y };
      await page.mouse.click(rect.x + offset.x, rect.y + offset.y);
    },
    tapBackspaceKey: async () => {
      await page.keyboard.press('Backspace');
    },
    typeText: async (text: string) => {
      for (let i = 0; i < text.length; i++) {
        await page.keyboard.sendCharacter(text.charAt(i));
      }
    },
  };
};

function expectImpl(e: WebElementActions) {
  return {
    toExist: () => {
      return !!e.core;
    },
    toBeVisible: async () => {
      if (!e.core) {
        return false;
      }

      return isLocatorReady(e.core, page);
    },
  };
}

async function isLocatorReady(el: ElementHandle, page: Page) {
  const isVisibleHandle = await page.evaluateHandle((e) => {
    const style = window.getComputedStyle(e);
    return (
      style &&
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      style.opacity !== '0'
    );
  }, el);
  let visible = await isVisibleHandle.jsonValue();
  const box = await el.boxModel();
  return !!(visible && box);
}

function init(_?: any, _1?: any) {
  return null;
}

const webElementAsDetoxType = element as unknown as Detox.ElementFacade;
const webBy = by as unknown as Detox.ByFacade;
const webExpect = expectImpl as unknown as Detox.ExpectFacade;
export {
  webBy as by,
  device,
  webElementAsDetoxType as element,
  webExpect as expect,
  init,
};
