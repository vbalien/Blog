exports.id="pages-tags",exports.ids=["pages-tags"],exports.modules={"./pages/tags/index.mdx":(e,r,t)=>{"use strict";t.r(r),t.d(r,{Tags:()=>l,default:()=>d,preloadStates:()=>i}),t("core-js/modules/es.array.index-of.js"),t("core-js/modules/es.array.map.js"),t("core-js/modules/es.object.keys.js"),t("react");var n=t("@mdx-js/react"),s=(t("core-js/modules/es.object.to-string.js"),t("core-js/modules/es.promise.js"),t("regenerator-runtime/runtime.js"),t("recoil"));function o(e,r,t,n,s,o,a){try{var u=e[o](a),c=u.value}catch(e){return void t(e)}u.done?r(c):Promise.resolve(c).then(n,s)}const a=(0,s.atom)({key:"tagState",default:(u=regeneratorRuntime.mark((function e(){return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.prev=0,e.next=3,fetch("/api/tags.json");case 3:return e.next=5,e.sent.json();case 5:return e.abrupt("return",e.sent);case 8:return e.prev=8,e.t0=e.catch(0),e.abrupt("return",{tags:[]});case 11:case"end":return e.stop()}}),e,null,[[0,8]])})),function(){var e=this,r=arguments;return new Promise((function(t,n){var s=u.apply(e,r);function a(e){o(s,t,n,a,c,"next",e)}function c(e){o(s,t,n,a,c,"throw",e)}a(void 0)}))})()});var u;function c(){return(c=Object.assign||function(e){for(var r=1;r<arguments.length;r++){var t=arguments[r];for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&(e[n]=t[n])}return e}).apply(this,arguments)}var i=[a],l=function(){var e=(0,s.useRecoilValueLoadable)(a);switch(e.state){case"hasValue":return(0,n.mdx)("ul",null,e.contents.tags.map((function(e){return(0,n.mdx)("li",{key:e},e)})));case"loading":return(0,n.mdx)("div",null,"Loading...");case"hasError":throw e.contents}},p={preloadStates:i,Tags:l};function d(e){var r=e.components,t=function(e,r){if(null==e)return{};var t,n,s=function(e,r){if(null==e)return{};var t,n,s={},o=Object.keys(e);for(n=0;n<o.length;n++)t=o[n],r.indexOf(t)>=0||(s[t]=e[t]);return s}(e,r);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(n=0;n<o.length;n++)t=o[n],r.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(s[t]=e[t])}return s}(e,["components"]);return(0,n.mdx)("wrapper",c({},p,t,{components:r,mdxType:"MDXLayout"}),(0,n.mdx)("h1",null,"Tags"),(0,n.mdx)(l,{mdxType:"Tags"}))}d.isMDXComponent=!0}};