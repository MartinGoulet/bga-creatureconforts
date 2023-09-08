const colors = {
   dcac28: 'yellow',
   '13586b': 'green',
   '7e797b': 'gray',
   b7313e: 'red',
   '650e41': 'purple',
};

function getColorName(code: string) {
   return colors[code];
}

function createCounter(id: string, value: number = 0): ebg.counter {
   const counter = new ebg.counter();
   counter.create(id);
   counter.setValue(value);
   return counter;
}
