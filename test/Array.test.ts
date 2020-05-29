import { equal } from "assert";
import { observable } from '../src/Observable';
import { watch } from '../src/Watch';

describe('Observable Array', () => {

  it('创建可观察的数组', (done) => {
    const model = observable({ items: [1, 2, 3] });
    equal(model.items[0], 1);
    watch(() => model.items[0], () => {
      equal(model.items[0], 2);
      done();
    });
    model.items[0] = 2;
  });

  it('push', (done) => {
    const model = observable({ items: [1, 2, 3] });
    watch(() => model.items.length, () => {
      equal(model.items.join(','), '1,2,3,4');
      done();
    });
    model.items.push(4);
    equal(model.items.length, 4);
  });

  it('pop', (done) => {
    const model = observable({ items: [1, 2, 3] });
    watch(() => model.items, () => {
      equal(model.items.join(','), '1,2');
      done();
    });
    model.items.pop();
    equal(model.items.length, 2);
  });

  it('unshift', (done) => {
    const model = observable({ items: [1, 2, 3] });
    watch(() => model.items, () => {
      equal(model.items.join(','), '0,1,2,3');
      done();
    });
    model.items.unshift(0);
    equal(model.items.length, 4);
  });

  it('shift', (done) => {
    const model = observable({ items: [1, 2, 3] });
    watch(() => model.items, () => {
      equal(model.items.join(','), '2,3');
      done();
    });
    const item = model.items.shift();
    equal(item, 1);
  });

  it('splice remove', (done) => {
    const model = observable({ items: [1, 2, 3] });
    watch(() => model.items, () => {
      equal(model.items.join(','), '1,3');
      done();
    });
    const items = model.items.splice(1, 1);
    equal(items.join(','), 2);
  });

  it('splice replace', (done) => {
    const model = observable({ items: [1, 2, 3] });
    watch(() => model.items, () => {
      equal(model.items.join(','), '1,4,3');
      done();
    });
    const items = model.items.splice(1, 1, 4);
    equal(items.join(','), 2);
  });

  it('splice insert', (done) => {
    const model = observable({ items: [1, 2, 3] });
    watch(() => model.items, () => {
      equal(model.items.join(','), '1,4,2,3');
      done();
    });
    model.items.splice(1, 0, 4);
  });

  it('reverse', (done) => {
    const model = observable({ items: [1, 2, 3] });
    watch(() => model.items, () => {
      equal(model.items.join(','), '3,2,1');
      done();
    });
    model.items.reverse()
  });

});