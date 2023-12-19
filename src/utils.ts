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

function createCounter(id: string | HTMLElement, value: number = 0): ebg.counter {
   const counter = new ebg.counter();
   counter.create(id);
   counter.setValue(value);
   return counter;
}

function countExtractions(mainArray, targetArray) {
   var mainArrayCounts = {};
   var targetArrayCounts = {};

   // Count occurrences of elements in the mainArray
   for (var i = 0; i < mainArray.length; i++) {
      var element = mainArray[i];
      mainArrayCounts[element] = (mainArrayCounts[element] || 0) + 1;
   }

   // Count occurrences of elements in the targetArray
   for (var j = 0; j < targetArray.length; j++) {
      var element = targetArray[j];
      targetArrayCounts[element] = (targetArrayCounts[element] || 0) + 1;
   }

   var minExtractions = 10000;

   // Calculate the minimum number of extractions
   for (var key in mainArrayCounts) {
      if (mainArrayCounts.hasOwnProperty(key)) {
         var mainCount = mainArrayCounts[key];
         var targetCount = targetArrayCounts[key] || 0;
         var extractions = Math.floor(targetCount / mainCount);
         minExtractions = Math.min(minExtractions, extractions);
      }
   }

   return minExtractions;
}

// this goes outside dojo class - before or after
function reloadCss() {
   const links = document.getElementsByTagName('link');
   for (var cl in links) {
      var link = links[cl];
      if (link.rel === 'stylesheet' && link.href.includes('99999')) {
         var index = link.href.indexOf('?timestamp=');
         var href = link.href;
         if (index >= 0) {
            href = href.substring(0, index);
         }

         link.href = href + '?timestamp=' + Date.now();

         console.log('reloading ' + link.href);
      }
   }
}
