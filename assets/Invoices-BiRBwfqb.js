import{j as e}from"./vendor-ui-Cn-AWZmU.js";import{a as x,L as h}from"./vendor-react-BHT4GRGd.js";import{L as j,C as o,d as c,a as f,b as N,F as v}from"./client-DgMJTZRL.js";import{I as y}from"./input-B9kTI4Cn.js";import{B as m}from"./button-DRab5i6-.js";import{S as g,D as w,B as b}from"./badge-BKw_XItu.js";import{b as C,u as I,f as S}from"./vendor-utils-CbB7EdWd.js";import"./index-DKYL_AX4.js";import{l as L,g as k}from"./invoiceService-CNowNvjy.js";import{S as D}from"./skeleton-ClRWhxbF.js";import{P as F}from"./plus-BapLzJnN.js";import{C as M,a as P}from"./chevron-up-Dc_7H3uy.js";import"./utils-B-GjzKLI.js";const J=()=>{const[s,r]=x.useState(""),i=C(),{data:t=[],isLoading:d}=I({queryKey:["invoices"],queryFn:k}),u=async()=>{try{await L(),i.invalidateQueries({queryKey:["invoices"]})}catch(a){console.error("Error loading mock data:",a)}},n=t.filter(a=>a.supplierName.toLowerCase().includes(s.toLowerCase())||a.invoiceNumber.toLowerCase().includes(s.toLowerCase())),p=[...n].sort((a,l)=>new Date(l.date).getTime()-new Date(a.date).getTime());return e.jsx(j,{title:"Invoices",description:"Track and manage supplier invoices",children:e.jsxs("div",{className:"p-6",children:[e.jsxs("div",{className:"flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6",children:[e.jsxs("div",{className:"relative w-full sm:w-96",children:[e.jsx(g,{className:"absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"}),e.jsx(y,{placeholder:"Search invoices...",value:s,onChange:a=>r(a.target.value),className:"pl-10"})]}),e.jsxs("div",{className:"flex gap-2",children:[e.jsxs(m,{variant:"outline",onClick:u,children:[e.jsx(w,{className:"mr-2 h-4 w-4"}),"Load Mock Data"]}),e.jsx(m,{asChild:!0,children:e.jsxs(h,{to:"/invoices/upload",children:[e.jsx(F,{className:"mr-2 h-4 w-4"}),"Add Invoice"]})})]})]}),d?e.jsx("div",{className:"space-y-4",children:[...Array(3)].map((a,l)=>e.jsx(D,{className:"h-24 w-full"},l))}):n.length===0?e.jsx(o,{children:e.jsx(c,{className:"p-6 text-center",children:e.jsx("p",{className:"text-muted-foreground",children:"No invoices found"})})}):e.jsxs(o,{children:[e.jsx(f,{children:e.jsx(N,{children:"Recent Invoices"})}),e.jsx(c,{children:e.jsx("div",{className:"space-y-4",children:p.map(a=>e.jsx(T,{invoice:a},a.id))})})]})]})})},T=({invoice:s})=>{const[r,i]=x.useState(!1);return e.jsxs("div",{className:"border rounded-lg overflow-hidden",children:[e.jsxs("div",{className:"p-4 bg-white cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between",onClick:()=>i(!r),children:[e.jsxs("div",{className:"flex items-center gap-3 mb-2 sm:mb-0",children:[e.jsx("div",{className:"h-10 w-10 rounded-full bg-restaurant-secondary flex items-center justify-center",children:e.jsx(v,{className:"h-5 w-5 text-restaurant"})}),e.jsxs("div",{children:[e.jsx("h3",{className:"font-medium",children:s.supplierName}),e.jsxs("p",{className:"text-xs text-muted-foreground",children:["#",s.invoiceNumber," • ",S(new Date(s.date),"MMM d, yyyy")]})]})]}),e.jsxs("div",{className:"flex items-center gap-4 sm:gap-8 w-full sm:w-auto justify-between sm:justify-start",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-xs text-muted-foreground",children:"Amount"}),e.jsxs("p",{className:"font-medium",children:["$",s.total.toFixed(2)]})]}),e.jsxs("div",{children:[e.jsx("p",{className:"text-xs text-muted-foreground",children:"Status"}),e.jsx("div",{children:e.jsx(b,{variant:"outline",className:s.paidStatus==="paid"?"bg-green-50 text-green-600 border-green-200":s.paidStatus==="partial"?"bg-yellow-50 text-yellow-600 border-yellow-200":"bg-red-50 text-red-600 border-red-200",children:s.paidStatus==="paid"?"Paid":s.paidStatus==="partial"?"Partial":"Unpaid"})})]}),e.jsx("div",{className:"text-muted-foreground",children:r?e.jsx(M,{size:18}):e.jsx(P,{size:18})})]})]}),r&&e.jsxs("div",{className:"bg-gray-50 p-4 border-t",children:[e.jsx("h4",{className:"text-sm font-medium mb-2",children:"Items"}),e.jsxs("div",{className:"space-y-2",children:[s.items.map((t,d)=>e.jsxs("div",{className:"flex justify-between text-sm",children:[e.jsxs("span",{children:[t.product?.name||"Unknown Product"," (",t.quantity," x $",t.unitPrice.toFixed(2),")"]}),e.jsxs("span",{className:"font-medium",children:["$",t.total.toFixed(2)]})]},d)),e.jsxs("div",{className:"pt-2 border-t flex justify-between text-sm font-medium",children:[e.jsx("span",{children:"Total"}),e.jsxs("span",{children:["$",s.total.toFixed(2)]})]})]})]})]})};export{J as default};
//# sourceMappingURL=Invoices-BiRBwfqb.js.map
