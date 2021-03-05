# liona-feeds
A Node.js module that provided an REST endpoint to receive news feeds.
## Installation 
```sh
npm install @huluvu424242/liona-feeds --save
yarn add @huluvu424242/liona-feeds
bower install @huluvu424242/liona-feeds --save
```
## Usage
### Javascript
```javascript
var feeds = require('@huluvu424242/liona-feeds');
var feedContentJSON = feeds.getFeed('https://www.tagesschau.de/xml/atom/');
```
```sh
Output should be an response
```
### TypeScript
```typescript
import { getFeed } from '@huluvu424242/liona-feeds';
console.log(getFeed('https://www.zdf.de/rss/zdf/nachrichten'))
```
```sh
Output should be an response
```
### AMD
```javascript
define(function(require,exports,module){
  var feedsReader = require('@huluvu424242/liona-feeds');
});
```
## Test 
```sh
npm run test
```
