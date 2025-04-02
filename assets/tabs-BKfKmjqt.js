import{s as h}from"./client-DgMJTZRL.js";import{u as w,a as g}from"./index-DKYL_AX4.js";import{l as $,m as z,j as c,c as D,n as V,h as v,o as x,p as G,I as L,i as m,a as K}from"./vendor-ui-Cn-AWZmU.js";import{a as l}from"./vendor-react-BHT4GRGd.js";const Z=async(a,e)=>{try{const t=await h.functions.invoke("analyze-image",{body:{imageBase64:a,prompt:e}});if(t.error)throw new Error("Analysis failed");if(!t.data||!t.data.analysis)throw new Error("Invalid response format");return t.data.analysis}catch{throw w.error("Failed to analyze image"),new Error("Analysis failed")}},ee=async a=>{try{const e=await h.functions.invoke("analyze-product",{body:{imageBase64:a}});if(e.error)throw new Error("Analysis failed");if(!e.data)throw new Error("Invalid response format");return e.data.product&&typeof e.data.product.currentStock<"u"&&(e.data.product.currentStock=1),e.data}catch{throw w.error("Failed to analyze product"),new Error("Analysis failed")}};var y="Tabs",[O,ae]=D(y,[x]),I=x(),[B,T]=O(y),N=l.forwardRef((a,e)=>{const{__scopeTabs:t,value:o,onValueChange:s,defaultValue:d,orientation:r="horizontal",dir:u,activationMode:b="automatic",...p}=a,i=$(u),[n,f]=z({prop:o,onChange:s,defaultProp:d});return c.jsx(B,{scope:t,baseId:V(),value:n,onValueChange:f,orientation:r,dir:i,activationMode:b,children:c.jsx(v.div,{dir:i,"data-orientation":r,...p,ref:e})})});N.displayName=y;var A="TabsList",C=l.forwardRef((a,e)=>{const{__scopeTabs:t,loop:o=!0,...s}=a,d=T(A,t),r=I(t);return c.jsx(G,{asChild:!0,...r,orientation:d.orientation,dir:d.dir,loop:o,children:c.jsx(v.div,{role:"tablist","aria-orientation":d.orientation,...s,ref:e})})});C.displayName=A;var E="TabsTrigger",R=l.forwardRef((a,e)=>{const{__scopeTabs:t,value:o,disabled:s=!1,...d}=a,r=T(E,t),u=I(t),b=_(r.baseId,o),p=F(r.baseId,o),i=o===r.value;return c.jsx(L,{asChild:!0,...u,focusable:!s,active:i,children:c.jsx(v.button,{type:"button",role:"tab","aria-selected":i,"aria-controls":p,"data-state":i?"active":"inactive","data-disabled":s?"":void 0,disabled:s,id:b,...d,ref:e,onMouseDown:m(a.onMouseDown,n=>{!s&&n.button===0&&n.ctrlKey===!1?r.onValueChange(o):n.preventDefault()}),onKeyDown:m(a.onKeyDown,n=>{[" ","Enter"].includes(n.key)&&r.onValueChange(o)}),onFocus:m(a.onFocus,()=>{const n=r.activationMode!=="manual";!i&&!s&&n&&r.onValueChange(o)})})})});R.displayName=E;var j="TabsContent",S=l.forwardRef((a,e)=>{const{__scopeTabs:t,value:o,forceMount:s,children:d,...r}=a,u=T(j,t),b=_(u.baseId,o),p=F(u.baseId,o),i=o===u.value,n=l.useRef(i);return l.useEffect(()=>{const f=requestAnimationFrame(()=>n.current=!1);return()=>cancelAnimationFrame(f)},[]),c.jsx(K,{present:s||i,children:({present:f})=>c.jsx(v.div,{"data-state":i?"active":"inactive","data-orientation":u.orientation,role:"tabpanel","aria-labelledby":b,hidden:!f,id:p,tabIndex:0,...r,ref:e,style:{...a.style,animationDuration:n.current?"0s":void 0},children:f&&d})})});S.displayName=j;function _(a,e){return`${a}-trigger-${e}`}function F(a,e){return`${a}-content-${e}`}var W=N,P=C,k=R,M=S;const te=W,q=l.forwardRef(({className:a,...e},t)=>c.jsx(P,{ref:t,className:g("inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",a),...e}));q.displayName=P.displayName;const H=l.forwardRef(({className:a,...e},t)=>c.jsx(k,{ref:t,className:g("inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",a),...e}));H.displayName=k.displayName;const J=l.forwardRef(({className:a,...e},t)=>c.jsx(M,{ref:t,className:g("mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",a),...e}));J.displayName=M.displayName;export{te as T,Z as a,q as b,H as c,J as d,ee as e};
//# sourceMappingURL=tabs-BKfKmjqt.js.map
