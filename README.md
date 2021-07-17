# detox-web
Abstraction on top of puppeteer to support Detox test to run on the web platform + some helpers to shorten your test code.

## Installation
```sh
yarn add detox-web
```
or
```sh
npm install detox-web
```

## Usage

```js
import { by, device, element, expect } from 'detox-web'
// and extra helpers to simplify test code :)
import {
  replaceTextById,
  isVisibleByText,
  isVisibleById,
  tapById,
  tapByText,
  tapByLabel,
  reset,
} from 'detox-web'

describe('User should be welcomed by required onboarding screen', () => {
  beforeAll(async () => {
    await resetAndLoginAs('user_onboarding');
  });
  it('we should be able to fill our details', async () => {
    await replaceTextById('email', 'test-onboarding@webridge.nl');
    await replaceTextById('telephone', '0612345678');
    await tapByText('English');
    await tapByText('Nederlands');
    await tapById('save-button-profile');
  });
});
```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT
