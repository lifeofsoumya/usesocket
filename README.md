## Usage example
```js
import useSocketData from 'usesocket';

const { data, error, isConnected } = useSocketData({
  eventName: 'listingData',
  endpoint: 'listing-page',
  onMessage: (msg) => console.log('Custom handler:', msg),
});
```