!function(e){var t={};function n(o){if(t[o])return t[o].exports;var r=t[o]={i:o,l:!1,exports:{}};return e[o].call(r.exports,r,r.exports,n),r.l=!0,r.exports}n.m=e,n.c=t,n.d=function(e,t,o){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:o})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var o=Object.create(null);if(n.r(o),Object.defineProperty(o,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var r in e)n.d(o,r,function(t){return e[t]}.bind(null,r));return o},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=0)}([function(e,t,n){"use strict";n.r(t),n.d(t,"inset",(function(){return r})),window.Module={onRuntimeInitialized:()=>{console.log("[onRuntimeInitialized]"),a(Module)}};const o=e=>Array.from(Array(e).keys()),r=(e,t,n,o,r,i)=>[e+r,t+i,n-2*r,o-2*i],i=(e,t)=>()=>{console.log("[onProcessImage]");const{data:n,width:i,height:a}=(()=>{console.log("[getImageData]");const e=document.getElementById("input-image"),t=document.createElement("canvas");t.width=e.width,t.height=e.height;const n=t.getContext("2d");return n.drawImage(e,0,0,e.width,e.height),n.getImageData(0,0,t.width,t.height)})(),c=t(n,i,a),l=c/e.HEAP32.BYTES_PER_ELEMENT,d=e.HEAP32.slice(l,l+8),[u,g,s,m,h,f,p,y]=d,w=[u,g,s,m];console.log(JSON.stringify(w)),console.log(JSON.stringify([h,f,p,y]));const I=h*f*p,E=e.HEAPU8.slice(y,y+I),b=1===p?((e,t,n)=>{console.log("[imageDataFrom1Channel]");const o=new Uint8ClampedArray(t*n*4);return e.forEach((e,t)=>{const n=4*t;o[n]=e,o[n+1]=e,o[n+2]=e,o[n+3]=255}),new ImageData(o,t,n)})(E,h,f):((e,t,n)=>{console.log("[imageDataFrom4Channels]");const o=new Uint8ClampedArray(e);return new ImageData(o,t,n)})(E,h,f);(e=>{console.log("[drawOutputImage]");const t=document.getElementById("output-image");t.width=e.width,t.height=e.height,t.getContext("2d").putImageData(e,0,0)})(b),(e=>{console.log("[drawBoundingBox]");const t=document.getElementById("input-image-overlay").getContext("2d");t.strokeStyle="red",t.lineWidth=2,t.strokeRect(...r(...e,2,2))})(w),((e,t)=>{console.log("[cropCells]");const n=document.getElementById("input-image"),i=document.createElement("canvas");i.width=n.width,i.height=n.height;const a=i.getContext("2d");a.drawImage(n,0,0,n.width,n.height);const c=document.getElementById("cells"),[l,d,u,g]=r(...t,2,2),s=u/9,m=g/9;for(const e of o(9)){const t=document.createElement("div"),n=d+e*m;for(const e of o(9)){const o=l+e*s,i=a.getImageData(...r(o,n,s,m,2,2));console.dir(i);const c=document.createElement("canvas");c.setAttribute("class","cell"),c.width=i.width,c.height=i.height,c.getContext("2d").putImageData(i,0,0),t.appendChild(c)}c.appendChild(t)}})(0,w),e._free(c)},a=e=>{console.log("[init]");const t=(e=>{console.log("[wrapProcessImage]");return e.cwrap("processImage","number",["array","number","number"])})(e);document.getElementById("process-image-btn").addEventListener("click",i(e,t));const n=document.getElementById("input-image"),o=document.getElementById("input-image-overlay");o.width=n.width,o.height=n.height}}]);
//# sourceMappingURL=bundle.js.map