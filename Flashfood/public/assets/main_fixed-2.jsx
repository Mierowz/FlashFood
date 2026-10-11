import React, {useEffect, useMemo, useState} from 'react';
import {createRoot} from 'react-dom/client';
import './styles.css';
import {ACCOUNTS, DEFAULT_STORE, FOODS} from './demoData';

// Extra demo foods. Add your own matching images to /assets/ using these exact filenames.
const EXTRA_FOODS=[
  {id:'burger',name:'Burger',price:55,img:'burger.jpeg',tag:'Classic burger',allergens:['Gluten','Dairy'],canteen:'Main Canteen'},
  {id:'fries',name:'French Fries',price:35,img:'fries.jpeg',tag:'Crispy fries',allergens:['Gluten'],canteen:'Main Canteen'},
  {id:'pizza',name:'Pizza',price:65,img:'pizza.jpeg',tag:'Cheesy slice',allergens:['Gluten','Dairy'],canteen:'Main Canteen'},
  {id:'carbonara',name:'Carbonara',price:70,img:'carbonara.jpeg',tag:'Creamy pasta',allergens:['Gluten','Dairy','Eggs'],canteen:'Main Canteen'},
  {id:'hotdog',name:'Hotdog Sandwich',price:45,img:'hotdog.jpeg',tag:'Quick bite',allergens:['Gluten'],canteen:'Main Canteen'},
  {id:'siopao',name:'Siopao',price:30,img:'siopao.jpeg',tag:'Steamed bun',allergens:['Gluten','Pork'],canteen:'Small Canteen'},
  {id:'fishballs',name:'Fish Balls',price:25,img:'fishballs.jpeg',tag:'Street-food favorite',allergens:['Finfish'],canteen:'Small Canteen'},
  {id:'bananacue',name:'Bananacue',price:25,img:'bananacue.jpeg',tag:'Caramelized banana snack',allergens:[],canteen:'Small Canteen'},
  {id:'pancakes',name:'Pancakes',price:40,img:'pancakes.jpeg',tag:'Sweet breakfast',allergens:['Gluten','Dairy','Eggs'],canteen:'Small Canteen'},
  {id:'nachos',name:'Nachos',price:50,img:'nachos.jpeg',tag:'Cheesy snack',allergens:['Gluten','Dairy'],canteen:'Small Canteen'}
];
const ALL_FOODS=[...FOODS,...EXTRA_FOODS];

const A='/assets/';
const STORE_KEY='flashfood-demo-store-v5';
const HISTORY_RESET_KEY='flashfood-history-reset-v1';
const STOCK_KEY='flashfood-demo-stock-v1';
const STOCK_DEFAULT={chicken:8,dumplings:10,noodles:7,spicy:5,bbq:12,siomai:6,rolls:10,stew:9,sandwich:8,burger:10,fries:12,pizza:8,carbonara:7,hotdog:10,siopao:12,fishballs:15,bananacue:14,pancakes:9,nachos:10};
const loadStock=()=>{try{return {...STOCK_DEFAULT,...(JSON.parse(localStorage.getItem(STOCK_KEY))||{})}}catch{return {...STOCK_DEFAULT}}};
const SESSION_KEY='flashfood-session-v4';
const loadStore=()=>{
 try{
    const saved=JSON.parse(localStorage.getItem(STORE_KEY));
    if(!saved)return DEFAULT_STORE;
    if(!localStorage.getItem(HISTORY_RESET_KEY)){
      const reset={};
      Object.entries(saved).forEach(([id,account])=>{
        reset[id]={...account,history:[],points:0,activeOrder:null};
      });
      localStorage.setItem(HISTORY_RESET_KEY,'1');
      return reset;
    }
    const cleaned={};
    Object.entries(saved).forEach(([id,account])=>{
      cleaned[id]=account.history?.length ? account : {...account,activeOrder:null};
    });
    return cleaned;
  }catch{return DEFAULT_STORE}
};
const saveStore=(s)=>localStorage.setItem(STORE_KEY,JSON.stringify(s));
const foodById=id=>ALL_FOODS.find(f=>f.id===id);
const ALLERGENS=['Pork','Chicken','Finfish','Shellfish','Dairy','Eggs','Peanuts','Gluten'];
const NUTRITION_INFO={
 chicken:{calories:320,protein:'24g',carbs:'28g',fat:'12g',sodium:'620mg'},
 dumplings:{calories:280,protein:'11g',carbs:'34g',fat:'11g',sodium:'710mg'},
 noodles:{calories:410,protein:'14g',carbs:'58g',fat:'14g',sodium:'980mg'},
 spicy:{calories:390,protein:'16g',carbs:'46g',fat:'16g',sodium:'1,050mg'},
 bbq:{calories:350,protein:'25g',carbs:'31g',fat:'13g',sodium:'760mg'},
 siomai:{calories:300,protein:'15g',carbs:'30g',fat:'13g',sodium:'790mg'},
 rolls:{calories:260,protein:'9g',carbs:'29g',fat:'12g',sodium:'540mg'},
 stew:{calories:360,protein:'23g',carbs:'35g',fat:'13g',sodium:'690mg'},
 sandwich:{calories:330,protein:'18g',carbs:'38g',fat:'11g',sodium:'680mg'},
 burger:{calories:430,protein:'22g',carbs:'39g',fat:'22g',sodium:'780mg'},
 fries:{calories:310,protein:'4g',carbs:'41g',fat:'15g',sodium:'330mg'},
 pizza:{calories:290,protein:'13g',carbs:'34g',fat:'12g',sodium:'620mg'},
 carbonara:{calories:520,protein:'19g',carbs:'58g',fat:'24g',sodium:'760mg'},
 hotdog:{calories:360,protein:'14g',carbs:'34g',fat:'19g',sodium:'820mg'},
 siopao:{calories:240,protein:'9g',carbs:'34g',fat:'8g',sodium:'480mg'},
 fishballs:{calories:190,protein:'10g',carbs:'20g',fat:'8g',sodium:'520mg'},
 bananacue:{calories:220,protein:'2g',carbs:'42g',fat:'7g',sodium:'5mg'},
 pancakes:{calories:280,protein:'7g',carbs:'42g',fat:'9g',sodium:'430mg'},
 nachos:{calories:390,protein:'10g',carbs:'43g',fat:'20g',sodium:'650mg'}
};
const getNutrition=food=>food?.nutrition?.calories?food.nutrition:NUTRITION_INFO[food?.id]||{calories:'—',protein:'—',carbs:'—',fat:'—',sodium:'—'};
const normalizeAllergen=a=>String(a||'').trim().toLowerCase();
const isActuallyHealthy=food=>{const n=food?.nutrition||{};return n.balanced===true && n.protein==='high' && n.vegetables===true && n.fried===false && n.highSodium===false;};
const cloneDefault=()=>JSON.parse(JSON.stringify(DEFAULT_STORE));
const initialPointsFor=id=>{
 const str=String(id||'student');
 let hash=0; for(let i=0;i<str.length;i++) hash=(hash*31+str.charCodeAt(i))>>>0;
 return 20+(hash%81);
};

function App(){
 const [store,setStore]=useState(loadStore);
 const [accountId,setAccountId]=useState(()=>localStorage.getItem(SESSION_KEY)||null);
 const [screen,setScreen]=useState(accountId?'home':'login');
 const [selected,setSelected]=useState(null);
 const [toast,setToast]=useState('');
 const [crowd,setCrowd]=useState(5);
 const [stock,setStock]=useState(loadStock);
 const [order,setOrder]=useState(null);
 const account=accountId?store[accountId]:null;
 const childId=account?.role==='parent'?account.childId:account?.id;
 const child=childId?store[childId]:null;
 const cart=child?.cart||[];
 const total=cart.reduce((s,id)=>s+(foodById(id)?.price||0),0);
 const friends=Object.values(store).filter(a=>a.role===account?.role && a.id!==account?.id && (!account?.friendIds || account.friendIds.includes(a.id)));

 useEffect(()=>saveStore(store),[store]);
 useEffect(()=>{
   if(!store || !Object.keys(store).length)return;
   const marker='flashfood-points-initialized-v1';
   if(localStorage.getItem(marker))return;
   const next={...store};
   Object.entries(next).forEach(([id,a])=>{
     if(a.role==='student' && (!Number.isFinite(a.points) || a.points===0)) next[id]={...a,points:initialPointsFor(id)};
   });
   saveStore(next); setStore(next); localStorage.setItem(marker,'1');
 },[]);
 useEffect(()=>localStorage.setItem(STOCK_KEY,JSON.stringify(stock)),[stock]);
 useEffect(()=>{
   const sync=()=>setStore(loadStore());
   window.addEventListener('storage',sync); window.addEventListener('flashfood-sync',sync);
   return()=>{window.removeEventListener('storage',sync);window.removeEventListener('flashfood-sync',sync)};
 },[]);
 useEffect(()=>{if(toast){const t=setTimeout(()=>setToast(''),2200);return()=>clearTimeout(t)}},[toast]);
 const syncStore=next=>{setStore(next);saveStore(next);window.dispatchEvent(new Event('flashfood-sync'))};
 const updateChild=fn=>syncStore({...store,[childId]:fn({...store[childId]})});
 const safetyReason=(food)=>{
   if(!child)return null;
   if(child.restrictions?.includes(food.id)) return 'This food is restricted by the parent.';
   const hit=(food.allergens||[]).find(a=>child.allergies?.some(x=>normalizeAllergen(x)===normalizeAllergen(a)));
   if(hit)return `Blocked because ${child.name} is allergic to ${hit}.`;
   return null;
 };
 const unsafeCart=cart.map(foodById).filter(Boolean).filter(f=>safetyReason(f)); 
 const addToCart=(food)=>{const reason=safetyReason(food);if(reason){setToast(reason);return false;}const inCart=cart.filter(id=>id===food.id).length;const left=stock[food.id]??0;if(inCart>=left){setToast(`${food.name} is out of stock.`);return false;}updateChild(c=>({...c,cart:[...c.cart,food.id]}));setToast(`${food.name} added to ${child.name}'s cart`);return true};
 const toggleFavorite=foodId=>updateChild(c=>({...c,favorites:c.favorites.includes(foodId)?c.favorites.filter(id=>id!==foodId):[...c.favorites,foodId]}));
 const removeFromCart=index=>updateChild(c=>({...c,cart:c.cart.filter((_,i)=>i!==index)}));
 const login=id=>{setAccountId(id);localStorage.setItem(SESSION_KEY,id);setScreen('home')};
 const logout=()=>{localStorage.removeItem(SESSION_KEY);setAccountId(null);setScreen('login');setSelected(null)};
 const unfriend=friendId=>{syncStore({...store,[account.id]:{...store[account.id],friendIds:friends.filter(f=>f.id!==friendId).map(f=>f.id)}});setToast('Friend removed');};
 const resetDemo=()=>{const fresh=cloneDefault();Object.entries(fresh).forEach(([id,a])=>{if(a.role==='student')fresh[id]={...a,history:[],points:initialPointsFor(id),activeOrder:null};});syncStore(fresh);localStorage.setItem('flashfood-points-initialized-v1','1');const freshStock={...STOCK_DEFAULT};setStock(freshStock);localStorage.setItem(STOCK_KEY,JSON.stringify(freshStock));setToast('Demo accounts reset');};
 const completeOrder=(method,total,pickup,recipient,deliveryLocation=null)=>{const now=new Date();const id='FF-'+Math.floor(100000+Math.random()*900000);const items=[...(cart||[])];const record={id,total,method,pickup,items:items.length,status:'Placed',forName:recipient?.name||null,deliveryLocation,createdAt:now.toISOString(),updatedAt:now.toISOString()};setStock(prev=>{const next={...prev};items.forEach(foodId=>{next[foodId]=Math.max(0,(next[foodId]??0)-1)});return next});updateChild(c=>({...c,cart:[],balance:method==='School Balance'?c.balance-total:c.balance,points:Math.max(0,(c.points||0)-(method==='Points'?Math.round(total*2):0))+10,activeOrder:record,history:[...c.history,...items.map(foodId=>({foodId,forName:recipient?.name||null,date:now.toISOString().slice(0,10),time:now.toLocaleTimeString([], {hour:'numeric',minute:'2-digit'})}))]}));return record;};
 if(screen==='login')return <Login accounts={store} onLogin={login} resetDemo={resetDemo}/>;
 if(!account)return <Login accounts={store} onLogin={login} resetDemo={resetDemo}/>;
 return <div className="app-shell">
   <header className="topbar"><button className="brand" onClick={()=>setScreen('home')}><span className="bolt">⚡</span><span>FlashFood</span></button><div className="top-actions"><button className="icon-btn" onClick={()=>setScreen('cart')}>🛒{cart.length>0&&<b>{cart.length}</b>}</button><button className="avatar-btn" onClick={()=>setScreen('profile')}><img src={A+account.avatar}/></button></div></header>
   <main className="main">{account.role==='student'
    ?<Student screen={screen} go={setScreen} foods={ALL_FOODS} friends={friends} account={account} add={addToCart} selected={selected} setSelected={setSelected} cart={cart} remove={removeFromCart} total={total} order={order} setOrder={setOrder} balance={child.balance} setBalance={b=>updateChild(c=>({...c,balance:typeof b==='function'?b(c.balance):b}))} crowd={crowd} setCrowd={setCrowd} child={child} safetyReason={safetyReason} toast={setToast} completeOrder={completeOrder} toggleFavorite={toggleFavorite} unsafeCart={unsafeCart} stock={stock} updateChild={fn=>updateChild(fn)}/>
    :<Parent screen={screen} go={setScreen} foods={ALL_FOODS} child={child} account={account} friends={friends} store={store} updateStore={syncStore} add={addToCart} cart={cart} remove={removeFromCart} total={total} order={order} setOrder={setOrder} balance={child.balance} setBalance={b=>updateChild(c=>({...c,balance:typeof b==='function'?b(c.balance):b}))} toast={setToast} safetyReason={safetyReason} completeOrder={completeOrder} unsafeCart={unsafeCart} stock={stock} updateChild={updateChild}/>}</main>
   {screen!=='checkout'&&screen!=='success'&&<BottomNav screen={screen} go={setScreen} role={account.role}/>}
   {toast&&<div className="toast">✓ {toast}</div>}
 </div>
}

function Login({accounts,onLogin,resetDemo}){
 const [schoolId,setSchoolId]=useState('22-3032-911');
 const [password,setPassword]=useState('');
 const [showPassword,setShowPassword]=useState(false);
 const [error,setError]=useState('');
 const [roleChoice,setRoleChoice]=useState('student');
 const normalized=schoolId.trim().toUpperCase();
 const matches=Object.values(accounts).filter(a=>a.schoolId?.toUpperCase()===normalized || (a.linkedSchoolIds||[]).some(id=>id.toUpperCase()===normalized));
 const exact=matches.filter(a=>a.schoolId?.toUpperCase()===normalized);
 const match=exact.length>1 ? (exact.find(a=>a.role===roleChoice)||exact[0]) : (exact[0]||matches[0]);
 const expectedPassword=match?.role==='parent' ? accounts[match.childId]?.password : match?.password;
 const canLogin=!!match && password===expectedPassword;
 const submit=()=>{if(!match){setError('No linked account found for this School ID.');return;}if(!canLogin){setError('Incorrect password.');return;}setError('');onLogin(match.id)};
 return <div className="login-page"><div className="login-card"><div className="login-logo"><span>⚡</span>FlashFood</div><p className="eyebrow">SCHOOL CANTEEN ACCESS</p><h1>Good food.<br/>Less waiting.</h1><p className="muted">Enter a School ID and password. Parent accounts use the password of their linked student's account.</p><label>School ID</label><input value={schoolId} onChange={e=>{setSchoolId(e.target.value);setError('')}} placeholder="e.g. 22-3032-911" autoFocus/><label>Password</label><div className="password-field"><input type={showPassword?'text':'password'} value={password} onChange={e=>{setPassword(e.target.value);setError('')}} onKeyDown={e=>{if(e.key==='Enter')submit()}}/><button type="button" className="show-password" onClick={()=>setShowPassword(v=>!v)}>{showPassword?'Hide':'Show'}</button></div>{exact.length>1&&<div className="role-switch"><button className={roleChoice==='student'?'active':''} onClick={()=>setRoleChoice('student')}>Student</button><button className={roleChoice==='parent'?'active':''} onClick={()=>setRoleChoice('parent')}>Parent</button></div>}<div className="login-match">{match?<><b>{match.name}</b><span>{match.role==='parent'?'Parent account · linked to '+match.linkedSchoolIds.join(', '):'Student account · '+match.grade}</span></>:<span>No linked account found for this School ID.</span>}</div>{error&&<div className="login-error">{error}</div>}<button className="primary wide" disabled={!match||!password} onClick={submit}>Enter FlashFood →</button><div className="login-examples"><b>Demo IDs</b><span>22-3032-911 · 26-5003-304 · 16-0087-898</span><small>Parent IDs: P-22-3032-911 · P-26-5003-304 · 16-0087-898</small></div><button className="reset-demo" onClick={resetDemo}>Reset demo data</button><p className="login-note">Demo build · AI features are simulated for presentation</p></div></div>
}

function Student({screen,go,foods,friends,account,add,selected,setSelected,cart,remove,total,order,setOrder,balance,setBalance,crowd,setCrowd,child,safetyReason,toast,completeOrder,toggleFavorite,unsafeCart,stock,updateChild}){
 if(screen==='home')return <StudentHome go={go} foods={foods} friends={friends} add={add} balance={balance} setBalance={setBalance} toast={toast} crowd={crowd} setCrowd={setCrowd} child={child} safetyReason={safetyReason} completeOrder={completeOrder} toggleFavorite={toggleFavorite} unsafeCart={unsafeCart} stock={stock} updateChild={updateChild}/>;
 if(screen==='menu')return <Menu go={go} foods={foods} add={add} setSelected={setSelected} child={child} safetyReason={safetyReason} toggleFavorite={toggleFavorite} stock={stock}/>;
 if(screen==='item')return <Item food={selected} go={go} add={add} safetyReason={safetyReason} favorite={child.favorites.includes(selected?.id)} toggleFavorite={toggleFavorite} stock={stock}/>;
 if(screen==='cart')return <Cart go={go} cart={cart.map(foodById).filter(Boolean)} remove={remove} total={total} safetyReason={safetyReason} completeOrder={completeOrder} unsafeCart={unsafeCart} stock={stock}/>;
 if(screen==='checkout')return <Checkout go={go} cart={cart.map(foodById).filter(Boolean)} total={total} balance={balance} points={child.points||0} toast={toast} completeOrder={completeOrder} stock={stock} friends={friends}/>;
 if(screen==='success')return <Success go={go} order={child.activeOrder}/>;
 if(screen==='order')return <OrderStatus go={go} child={child} updateChild={updateChild}/>;
 if(screen==='history')return <History go={go} child={child} foods={foods}/>;
 if(screen==='friends')return <Friends go={go} friends={friends} role="Student" onUnfriend={unfriend}/>;
 if(screen==='map')return <Map go={go} crowd={crowd}/>;
 if(screen==='saved')return <SavedSchools go={go}/>;
 if(screen==='profile')return <Profile go={go} child={child} account={account} balance={balance} goAllergies={()=>go('allergies')} updateChild={updateChild}/>;
 if(screen==='settings')return <Settings go={go} child={child} updateChild={updateChild}/>;
 if(screen==='assistance')return <MealAssistance go={go} child={child} parent={false}/>;
 if(screen==='allergies')return <AllergySettings go={go} child={child} title="My Allergies" description="Choose the ingredients you are allergic to. FlashFood will automatically block matching foods." updateChild={updateChild}/>;
 return null;
}
function BalanceCard({balance,setBalance,toast,points=150}){
  const [open,setOpen]=useState(false);
  const [amount,setAmount]=useState('100');
  const addMoney=()=>{
    const value=Number(amount);
    if(!Number.isFinite(value)||value<=0){toast?.('Enter a valid amount.');return;}
    setBalance(prev=>Number(prev)+value);
    setOpen(false);
    toast?.(`₱${value.toFixed(2)} added to your balance.`);
  };
  return <section className="balance-card">
    <div className="balance-card-head"><h3>Balance</h3></div>
    <div className="balance-row"><div className="balance-main"><div className="money">Balance:<strong>₱{Number(balance).toFixed(2)}</strong></div><button className="add-money-button" onClick={()=>setOpen(true)}>＋ Top Up</button></div></div>
    <div className="points-large"><div className="points-large-head"><div><b>Points</b><small>Available Points: {points}</small></div><strong>{points}/600</strong></div><div className="progress points-progress"><span style={{width:`${Math.min(100,(Number(points)||0)/600*100)}%`}}/></div></div>
    {open&&<div className="balance-modal-backdrop" onClick={()=>setOpen(false)}>
      <div className="balance-modal" onClick={e=>e.stopPropagation()}>
        <div className="balance-modal-head"><div><span className="ai-badge">WALLET</span><h3>Add Money</h3></div><button className="modal-close" onClick={()=>setOpen(false)}>×</button></div>
        <p className="muted">Choose how much you want to add to your FlashFood balance.</p>
        <div className="amount-options">{[50,100,200,500].map(v=><button key={v} className={Number(amount)===v?'selected':''} onClick={()=>setAmount(String(v))}>₱{v}</button>)}</div>
        <label className="amount-label">Custom amount<input type="number" min="1" step="1" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="Enter amount"/></label>
        <div className="balance-payment-section">
          <h4>Choose payment method</h4>
          <div className="balance-payment-options">
            <button className="balance-payment-option" onClick={addMoney}>
              <span className="balance-payment-icon">📱</span>
              <span><b>E-Wallet</b><small>Pay using your e-wallet</small></span>
            </button>
            <button className="balance-payment-option" onClick={addMoney}>
              <span className="balance-payment-icon">💳</span>
              <span><b>Card</b><small>Pay using your card</small></span>
            </button>
          </div>
        </div>
      </div>
    </div>}
  </section>
}

function StudentHome({go,foods,friends,add,balance,setBalance,toast,crowd,setCrowd,child,safetyReason,toggleFavorite,stock}){const ordered=[...foods].sort((a,b)=>(child.favorites.includes(b.id)?1:0)-(child.favorites.includes(a.id)?1:0));return <div className="screen"><Hero account={child} role="Student"/><BalanceCard balance={balance} setBalance={setBalance} toast={toast} points={child.points}/><div className="section-head"><h3 className="section-title">Friends</h3><button onClick={()=>go('friends')}>See all</button></div><div className="friends">{friends.slice(0,4).map(f=><div className="friend" key={f.id}><img src={A+f.avatar}/><span>{f.name}</span><small>Student</small></div>)}</div><div className="canteen-heading"><h3>Main Canteen</h3><button className="crowd-chip" onClick={()=>setCrowd(crowd===8?3:crowd+1)}>Busyness: {crowd}</button></div><div className="food-row">{ordered.filter(f=>f.canteen==='Main Canteen').map(f=><FoodCircle key={f.id} food={f} favorite={child.favorites.includes(f.id)} onClick={()=>go('menu')} onFavorite={()=>toggleFavorite(f.id)}/>)}</div><div className="canteen-heading"><h3>Small Canteen</h3></div><div className="food-row">{ordered.filter(f=>f.canteen==='Small Canteen').map(f=><FoodCircle key={f.id} food={f} favorite={child.favorites.includes(f.id)} onClick={()=>go('menu')} onFavorite={()=>toggleFavorite(f.id)}/>)}</div><div className="assistance-card"><div><span className="ai-badge">SDG 2 · ZERO HUNGER</span><h3>Meal Assistance</h3><p>Need help accessing a meal? Explore school-supported meal options and choose a safe meal.</p></div><button className="primary" onClick={()=>go('assistance')}>View meals →</button></div>{child.activeOrder&&<div className="order-banner" onClick={()=>go('order')}><div><span className="ai-badge">ORDER STATUS</span><b>Order {child.activeOrder.id}</b><small>{child.activeOrder.status} · Tap to track your meal</small></div><span className="order-arrow">›</span></div>}<div className="ai-card"><div><span className="ai-badge">AI DEMO</span><h3>Canteen crowd prediction</h3><p>Main Canteen is currently <b>{crowd<4?'quiet':crowd<7?'moderately busy':'busy'}</b>. Try ordering ahead to save time.</p></div><div className="ai-score">{crowd}<small>/10</small></div></div><section className="recommend"><div className="section-head"><h3>Recommended for you</h3><button onClick={()=>go('menu')}>See all</button></div><div className="recommend-grid">{ordered.slice(0,2).map(f=><MiniFood key={f.id} food={f} add={add} blocked={!!safetyReason(f)} favorite={child.favorites.includes(f.id)} stock={stock}/>)}</div></section></div>}
function Hero({account,role,child}){return <div className="hero"><div className="hero-left"><img src={A+account.avatar} className="profile-pic"/><div><div className="welcome">Welcome</div><strong>{account.name}</strong><div className="status">Status: {role}</div></div></div><img className="crest" src={A+'school-crest.jpg'}/><div className="details">{role==='Student'?<>Allergies: {account.allergies?.length?account.allergies.join(', '):'None'}<br/>Student ID: {account.schoolId}<br/>Grade & Section: {account.grade}</>:<>Child: {child?.name||'Not linked'}<br/>Student ID: {child?.schoolId||'—'}<br/>Grade & Section: {child?.grade||'—'}</>}</div></div>}
function FoodCircle({food,onClick,favorite,onFavorite}){return <div className="food-circle-wrap"><button className="food-circle" onClick={onClick}><img src={A+food.img}/></button><button className={`circle-fav ${favorite?'active':''}`} onClick={e=>{e.stopPropagation();onFavorite()}} aria-label={favorite?'Unfavorite '+food.name:'Favorite '+food.name}>★</button></div>}
function Menu({go,foods,add,setSelected,child,safetyReason,toggleFavorite,stock}){const [tab,setTab]=useState('new');const [canteen,setCanteen]=useState('All');const [nutritionOpen,setNutritionOpen]=useState(null);const favorites=new Set(child.favorites||[]);const list=useMemo(()=>{let x=foods.filter(f=>canteen==='All'||f.canteen===canteen);if(tab==='favorites')x=x.filter(f=>favorites.has(f.id));return [...x].sort((a,b)=>(favorites.has(b.id)?1:0)-(favorites.has(a.id)?1:0));},[foods,canteen,tab,child.favorites]);return <div className="screen"><PageHead title="Canteen Menu" go={go}/><div className="tabs"><button className={tab==='new'?'active':''} onClick={()=>setTab('new')}>What's New</button><button className={tab==='favorites'?'active':''} onClick={()=>setTab('favorites')}>Favorites</button><button className={tab==='all'?'active':''} onClick={()=>setTab('all')}>All Foods</button></div><div className="canteen-filter"><button className={canteen==='All'?'active':''} onClick={()=>setCanteen('All')}>All</button><button className={canteen==='Main Canteen'?'active':''} onClick={()=>setCanteen('Main Canteen')}>Main</button><button className={canteen==='Small Canteen'?'active':''} onClick={()=>setCanteen('Small Canteen')}>Small</button></div><p className="favorite-note">★ Favorites are prioritized and appear first in every canteen menu.</p><div className="menu-grid">{list.map(f=>{const n=getNutrition(f);return <div className="menu-item" key={f.id} onClick={()=>{setSelected(f);go('item')}}><div className="menu-image-wrap"><img src={A+f.img}/><button className="nutrition-button" onClick={e=>{e.stopPropagation();setNutritionOpen(nutritionOpen===f.id?null:f.id)}}>Nutrition</button>{favorites.has(f.id)&&<span className="favorite-badge">★ Favorite</span>}{safetyReason(f)&&<span className="blocked-badge">Blocked</span>}<button className={`food-favorite ${favorites.has(f.id)?'active':''}`} onClick={e=>{e.stopPropagation();toggleFavorite(f.id)}} aria-label={favorites.has(f.id)?'Unfavorite '+f.name:'Favorite '+f.name}>★</button></div><div className="menu-name">{f.name}</div><div className="price">₱{f.price}</div><small>{f.tag}</small>{nutritionOpen===f.id&&<div className="nutrition-panel" onClick={e=>e.stopPropagation()}><b>Nutritional Value</b><span>Calories <strong>{n.calories}</strong></span><span>Protein <strong>{n.protein}</strong></span><span>Carbs <strong>{n.carbs}</strong></span><span>Fat <strong>{n.fat}</strong></span><span>Sodium <strong>{n.sodium}</strong></span></div>}<small className={(stock[f.id]??0)<=2?'stock-low':'stock-ok'}>{(stock[f.id]??0)>0?`${stock[f.id]} left`:'Out of stock'}</small>{isActuallyHealthy(f)&&<small className="healthy-badge">🥗 Healthy choice</small>}{safetyReason(f)&&<small className="blocked-text">{safetyReason(f)}</small>}</div>})}</div></div>}
function Item({food,go,add,safetyReason,favorite,toggleFavorite,stock}){if(!food)return null;const reason=safetyReason(food);const n=getNutrition(food);const [showNutrition,setShowNutrition]=useState(false);return <div className="screen"><PageHead title="Food Details" go={go}/><div className="item-card"><div className="item-image-wrap"><img src={A+food.img} className="item-img"/><button className="nutrition-button item-nutrition-button" onClick={()=>setShowNutrition(v=>!v)}>{showNutrition?'Hide nutrition':'Nutrition'}</button><button className={`item-favorite ${favorite?'active':''}`} onClick={()=>toggleFavorite(food.id)}>{favorite?'★ Favorited':'☆ Favorite'}</button></div><div className="item-title"><h2>{food.name}</h2><span>₱{food.price}</span></div><div className="tag">{food.tag}</div><p>{food.desc}</p>{showNutrition&&<div className="nutrition-detail"><div><b>Nutritional Value</b><span>Per serving</span></div><section><span>Calories<strong>{n.calories}</strong></span><span>Protein<strong>{n.protein}</strong></span><span>Carbs<strong>{n.carbs}</strong></span><span>Fat<strong>{n.fat}</strong></span><span>Sodium<strong>{n.sodium}</strong></span></section></div>}<div className="allergen"><b>Allergy check</b><span>{food.allergens.length?food.allergens.join(' · '):'No listed allergens'}</span></div>{isActuallyHealthy(food)&&<div className="healthy-detail">🥗 <b>Healthy choice</b><span>High protein, includes vegetables, not fried, and not flagged as high-sodium in this demo.</span></div>}{reason?<div className="safety-block">🚫 {reason}</div>:<><div className={(stock[food.id]??0)<=2?'stock-detail low':'stock-detail'}>{(stock[food.id]??0)>0?`Stock: ${stock[food.id]} available`:'Out of stock'}</div><button className="primary wide" disabled={(stock[food.id]??0)<=0} onClick={()=>{if(add(food))go('cart')}}>{(stock[food.id]??0)>0?`Add to Cart · ₱${food.price}`:'Out of stock'}</button></>}{food.special&&<div className="special"><b>Special Instructions:</b><br/>{food.special}</div>}</div></div>}
function Cart({go,cart,remove,total,safetyReason,unsafeCart}){return <div className="screen"><PageHead title="Your Cart" go={go}/><div className="sync-banner">🔄 <b>Shared cart</b><span>Parent and child accounts see the same cart.</span></div>{cart.length===0?<Empty text="Your cart is empty." action={()=>go('menu')}/>:<><div className="cart-list">{cart.map((f,i)=><div className="cart-row" key={`${f.id}-${i}`}><img src={A+f.img}/><div><b>{f.name}</b><small>{f.canteen}</small></div><strong>₱{f.price}</strong><button onClick={()=>remove(i)}>×</button></div>)}</div><div className="total-card"><span>Order total</span><strong>₱{total.toFixed(2)}</strong></div><button className="primary wide" disabled={unsafeCart?.length>0} onClick={()=>go('checkout')}>{unsafeCart?.length?'Remove unsafe items before checkout':'Continue to checkout →'}</button></>}</div>}
function Checkout({go,cart,total,balance,points,toast,completeOrder,stock,friends=[]}){
  const [method,setMethod]=useState('School Balance');
  const [pickup,setPickup]=useState('Pick up');
  const [orderFor,setOrderFor]=useState('me');
  const [friendId,setFriendId]=useState('');
  const [friendWindow,setFriendWindow]=useState(false);
  const [building,setBuilding]=useState('');
  const [room,setRoom]=useState('');
  const recipient=orderFor==='friend' ? (friends.find(f=>f.id===friendId)||null) : null;
  const unavailable=cart.find(f=>(stock[f.id]??0)<=0);
  const norm=x=>String(x||'').trim().toLowerCase();
  const recipientIssue=recipient?cart.map(f=>{
    const first=recipient.name.split(' ')[0];
    if(recipient.restrictions?.includes(f.id))return `${f.name} is restricted for ${first}.`;
    const hit=(f.allergens||[]).find(a=>recipient.allergies?.some(x=>norm(x)===norm(a)));
    return hit?`${f.name} contains ${hit}, and ${first} is allergic.`:null;
  }).find(Boolean):null;
  const deliveryIncomplete=pickup==='Delivery'&&(!building.trim()||!room.trim());
  const submit=()=>{
    if(unavailable){toast(`${unavailable.name} is out of stock.`);return}
    if(orderFor==='friend'&&!recipient){toast('Choose a friend before submitting the order.');return}
    if(recipientIssue){toast(recipientIssue);return}
    if(deliveryIncomplete){toast('Enter the building and room number for delivery.');return}
    if(total>balance&&method==='School Balance'){toast('Not enough balance for this order.');return}
    const pointsNeeded=Math.round(total*2);
    if(points<pointsNeeded&&method==='Points'){toast(`Not enough points. You need ${pointsNeeded} points.`);return}
    const deliveryLocation=pickup==='Delivery'?{building:building.trim(),room:room.trim()}:null;
    const record=completeOrder(method,total,pickup,recipient,deliveryLocation);
    go('success');
    window.dispatchEvent(new CustomEvent('flashfood-order',{detail:record}));
  };
  return <div className="screen"><PageHead title="Checkout" go={()=>go('cart')}/><div className="checkout-card">
    <section className="checkout-section">
      <h3>Who is this order for?</h3>
      <div className="order-for-buttons">
        <button className={`order-for-button ${orderFor==='me'?'selected':''}`} onClick={()=>{setOrderFor('me');setFriendId('')}}>
          <span className="order-for-icon">🙋</span>
          <span><b>Myself</b><small>Order for yourself</small></span>
          {orderFor==='me'&&<strong>✓</strong>}
        </button>
        <button className={`order-for-button ${orderFor==='friend'?'selected':''}`} onClick={()=>setFriendWindow(true)}>
          <span className="order-for-icon">🎁</span>
          <span><b>{recipient?'Send to a friend':'Send to a friend'}</b><small>{recipient?recipient.name:'Choose from your friends'}</small></span>
          <strong className="order-for-arrow">›</strong>
        </button>
      </div>
      {recipient&&<div className="checkout-recipient">🎁 Order will be sent to <strong>{recipient.name}</strong></div>}
    </section>

    <section className="checkout-section">
      <h3>Fulfilment</h3><div className="choice-row">
        <button className={pickup==='Pick up'?'selected':''} onClick={()=>setPickup('Pick up')}><span>🏫 Pick up</span><small>Collect from the canteen</small></button>
        <button className={pickup==='Delivery'?'selected':''} onClick={()=>setPickup('Delivery')}><span>🚚 Delivery</span><small>Bring it to your classroom</small></button>
      </div>
      {pickup==='Delivery'&&<div className="delivery-details">
        <div className="delivery-details-heading"><span>📍</span><div><b>Delivery location</b><small>Tell us where to bring your order.</small></div></div>
        <div className="delivery-fields">
          <label><span>Building</span><input value={building} onChange={e=>setBuilding(e.target.value)} placeholder="e.g. Main Building"/></label>
          <label><span>Room number</span><input value={room} onChange={e=>setRoom(e.target.value)} placeholder="e.g. 304"/></label>
        </div>
      </div>}
    </section>

    <section className="checkout-section">
      <h3>Payment Method</h3><div className="methods">{['School Balance','Points','Cash on Pickup'].map(m=><button className={method===m?'selected':''} onClick={()=>setMethod(m)} key={m}>{m==='School Balance'?'💳 ':m==='Points'?'⭐ ':'💵 '}{m}<span>{m==='School Balance'?`₱${balance.toFixed(2)} available`:m==='Points'?`${points} points · ₱${(points*0.5).toFixed(2)} available`:'Pay at counter'}</span></button>)}</div>
    </section>
    {unavailable&&<div className="stock-warning">⚠️ {unavailable.name} is out of stock. Remove it before ordering.</div>}
    {recipientIssue&&<div className="stock-warning">⚠️ {recipientIssue} Remove it or choose someone else.</div>}
    <div className="order-summary"><span>🛒 {cart.length} item{cart.length!==1?'s':''}{recipient?` · for ${recipient.name.split(' ')[0]}`:''}</span><strong>₱{total.toFixed(2)}</strong></div>
    <button className="primary wide" disabled={!!unavailable||!!recipientIssue||(orderFor==='friend'&&!recipient)||deliveryIncomplete} onClick={submit}>Place Order →</button>
  </div>
  {friendWindow&&<div className="friend-modal-backdrop" onClick={()=>setFriendWindow(false)}>
    <div className="friend-modal" onClick={e=>e.stopPropagation()}>
      <div className="friend-modal-header"><div><h3>Send to a friend</h3><p>Select a friend from your connected network.</p></div><button className="friend-modal-close" onClick={()=>setFriendWindow(false)}>×</button></div>
      <div className="friend-modal-list">
        {friends.map(f=><button key={f.id} className={`friend-option ${orderFor==='friend'&&friendId===f.id?'selected':''}`} onClick={()=>{setOrderFor('friend');setFriendId(f.id);setFriendWindow(false)}}>
          <img src={A+f.avatar} alt="" />
          <span className="friend-option-info"><b>{f.name}</b><small>{f.role==='parent'?'Parent':'Student'} · School ID {f.schoolId}</small></span>
          {orderFor==='friend'&&friendId===f.id&&<strong>✓</strong>}
        </button>)}
      </div>
      {friends.length===0&&<div className="friend-modal-empty">No friends are available for this account.</div>}
    </div>
  </div>}
  </div>
}

function Success({go,order}){return <div className="screen success"><div className="success-icon">✓</div><h1>Order confirmed!</h1><p>Your order has been placed successfully.</p><div className="receipt"><div>Order ID<strong>{order?.id}</strong></div><div>For<strong>{order?.forName||'Me'}</strong></div><div>Amount<strong>₱{order?.total?.toFixed(2)}</strong></div><div>Method<strong>{order?.method}</strong></div><div>Fulfilment<strong>{order?.pickup}</strong></div></div><div className="pickup-card"><b>Order placed</b><span>Your meal is now in the preparation queue.</span></div><button className="primary wide" onClick={()=>go('order')}>Track order status →</button><button className="secondary wide" onClick={()=>go('home')}>Back to home</button></div>}
function OrderStatus({go,child,updateChild}){const order=child?.activeOrder;const steps=['Placed','Preparing','Ready'];const idx=Math.max(0,steps.indexOf(order?.status));const advance=()=>{if(!order)return;const next=steps[Math.min(idx+1,steps.length-1)];updateChild(c=>({...c,activeOrder:{...c.activeOrder,status:next,updatedAt:new Date().toISOString()}}));};const finishOrder=()=>{updateChild(c=>({...c,activeOrder:null}));go('history');};if(!order)return <div className="screen"><PageHead title="Order Status" go={go}/><Empty text="You don't have an active order yet." action={()=>go('menu')}/></div>;return <div className="screen"><PageHead title="Order Status" go={go}/><div className="order-status-card"><span className="ai-badge">LIVE DEMO STATUS</span><h2>{order.id}</h2><p>{order.pickup} · {order.items} item{order.items!==1?'s':''} · ₱{order.total.toFixed(2)}</p><div className="status-steps">{steps.map((step,i)=><div className={`status-step ${i<=idx?'done':''} ${i===idx?'current':''}`} key={step}><span>{i<idx?'✓':i===idx?'●':'○'}</span><div><b>{step}</b><small>{i===0?'Order received':i===1?'Canteen is preparing your food':'Ready for pickup'}</small></div></div>)}</div><div className="order-note">{order.status==='Ready'?'Your meal is ready. Please pick it up during your break.':order.status==='Preparing'?'The canteen is preparing your meal.':'Your order is confirmed and waiting to be prepared.'}</div>{idx<steps.length-1?<button className="primary wide" onClick={advance}>Simulate next update →</button>:<button className="secondary wide" onClick={finishOrder}>Finish order & view history →</button>}</div></div>}
function History({go,child,foods}){
 const [tab,setTab]=useState('recent');
 const rows=useMemo(()=>{
   if(tab==='recent'){
     return [...child.history].sort((a,b)=>`${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`));
   }
   const grouped={};
   child.history.forEach(h=>{
     if(!grouped[h.foodId])grouped[h.foodId]=[];
     grouped[h.foodId].push(h);
   });
   const x=Object.values(grouped).map(entries=>({
     ...entries[0],
     purchaseCount:entries.length,
     latest:entries.reduce((latest,h)=>`${h.date} ${h.time}`>`${latest.date} ${latest.time}`?h:latest,entries[0])
   }));
   return x.sort((a,b)=>tab==='most'
     ?(b.purchaseCount-a.purchaseCount)||`${b.latest.date} ${b.latest.time}`.localeCompare(`${a.latest.date} ${a.latest.time}`)
     :(a.purchaseCount-b.purchaseCount)||`${b.latest.date} ${b.latest.time}`.localeCompare(`${a.latest.date} ${a.latest.time}`));
 },[child.history,tab]);
 return <div className="screen"><PageHead title={`${child.name.split(' ')[0]}'s History`} go={go}/><div className="tabs history-tabs"><button className={tab==='most'?'active':''} onClick={()=>setTab('most')}>Most Bought</button><button className={tab==='least'?'active':''} onClick={()=>setTab('least')}>Least Bought</button><button className={tab==='recent'?'active':''} onClick={()=>setTab('recent')}>Recently Bought</button></div><div className="total-purchases">Total Purchases: {child.history.length}</div><div className="history-list">{rows.map((h,i)=>{const f=foodById(h.foodId);const count=h.purchaseCount;return <div className="history-row" key={`${h.foodId}-${tab}-${i}`}><img src={A+f.img}/><div><b>{f.name}</b>{h.forName&&<small>🎁 For {h.forName}</small>}{tab==='recent'?<small>Purchased on:<br/>{h.date}<br/>{h.time}</small>:<small><strong>{count} purchase{count!==1?'s':''}</strong></small>}</div><strong>₱{f.price}</strong><button onClick={()=>go('restrict')}>Restrict</button></div>})}</div></div>}
function Map({go,crowd}){return <div className="screen"><PageHead title="Canteen Map" go={go}/><div className="map-card"><div className="map-grid">{['Gate','Main Canteen','Library','Small Canteen','Gym','Clinic'].map((x,i)=><div className={'map-place p'+i} key={x}><span>●</span>{x}</div>)}</div></div><div className="map-info"><b>Main Canteen</b><span>Busyness: {crowd}/10</span><small>About 2 min walk from your classroom</small></div><div className="map-info"><b>Small Canteen</b><span>Quiet</span><small>About 4 min walk</small></div></div>}
function SavedSchools({go}){return <div className="screen"><PageHead title="Saved Schools" go={go}/><div className="school-card selected"><img src={A+'school-crest.jpg'}/><div><b>School ID: 67</b><span>Current school · Main Campus</span></div><strong>✓</strong></div><div className="school-card"><div className="school-placeholder">＋</div><div><b>Add another school</b><span>Save schools for quick access</span></div></div></div>}
function Profile({go,child,account,balance,goAllergies,updateChild,parent}){const [open,setOpen]=useState(false);return <div className="screen"><PageHead title="My Profile" go={go}/><Hero account={parent?account:child} role={parent?'Parent':'Student'}/><div className="profile-stats"><div><b>{child.points||0}</b><span>Points · ₱{((child.points||0)*0.5).toFixed(2)}</span></div><div><b>{child.history.length}</b><span>Purchases</span></div><div><b>₱{balance}</b><span>Balance</span></div></div><button className="setting-row setting-button" onClick={goAllergies}>Allergies <span>{child.allergies.join(', ')||'None'} ›</span></button><div className="setting-row">Food restrictions <span>{child.restrictions.length} items ›</span></div><div className="setting-row">Favorites <span>{child.favorites.length} foods ›</span></div><div className="profile-menu-wrap"><button className="profile-menu-trigger" onClick={()=>setOpen(!open)}>Account & Settings <span>⌄</span></button>{open&&<div className="profile-dropdown"><button onClick={()=>go('settings')}>⚙ Settings</button><button onClick={()=>{localStorage.removeItem(SESSION_KEY);window.location.reload()}} className="danger">↪ Log out</button></div>}</div></div>}
function Parent({screen,go,foods,friends,child,account,store,updateStore,updateChild,add,cart,remove,total,order,setOrder,balance,setBalance,toast,safetyReason,completeOrder,unsafeCart,stock}){if(screen==='home'||screen==='parent')return <div className="screen"><Hero account={account} role="Parent" child={child}/><div className="parent-banner"><span className="ai-badge">PARENT VIEW</span><h2>Keep meals safer and easier.</h2><p>Manage {child.name.split(' ')[0]}'s food choices, check purchases, and send meals directly.</p></div><div className="parent-network" style={{marginBottom:'28px'}}><div className="section-head" style={{marginBottom:'14px'}}><h3 className="section-title">Parent Network</h3><button onClick={()=>go('friends')}>See all</button></div><div className="friends" style={{marginBottom:0}}>{friends.slice(0,4).map(f=><div className="friend" key={f.id}><img src={A+f.avatar}/><span>{f.name}</span><small>Parent</small></div>)}</div></div><div className="parent-grid" style={{gap:'16px',marginTop:0}}><button onClick={()=>go('history')}><b>Purchase History</b><span>Review {child.history.length} purchases</span></button><button onClick={()=>go('restrict')}><b>Food Restrictions</b><span>{child.restrictions.length} items restricted</span></button><button onClick={()=>go('allergies')}><b>Allergies</b><span>{child.allergies.length} allergens blocked</span></button><button onClick={()=>go('sendmeal')}><b>Send a Meal</b><span>Buy lunch for {child.name.split(' ')[0]}</span></button><button onClick={()=>go('cart')}><b>Shared Cart</b><span>{cart.length} item{cart.length!==1?'s':''} · synced</span></button><button onClick={()=>go('assistance')}><b>Meal Assistance</b><span>School-supported meal options</span></button><button onClick={()=>go('order')}><b>Order Status</b><span>{child.activeOrder?child.activeOrder.status:'No active order'}</span></button></div><section className="recommend"><div className="section-head"><h3>Suggested for {child.name.split(' ')[0]}</h3></div><div className="recommend-grid">{foods.filter(f=>!safetyReason(f)).slice(0,2).map(f=><MiniFood key={f.id} food={f} add={add} blocked={false} favorite={child.favorites.includes(f.id)} stock={stock}/>)}</div></section></div>;
 if(screen==='history')return <History go={go} child={child} foods={foods}/>;
 if(screen==='allergies')return <AllergySettings go={go} child={child} title="Child Allergies" description={`Manage ${child.name.split(' ')[0]}'s allergies. Matching foods are automatically blocked from the shared cart.`} updateChild={fn=>updateStore({...store,[child.id]:fn({...store[child.id]})})}/>;
 if(screen==='restrict')return <Restrictions go={go} foods={foods} child={child} updateChild={fn=>updateStore({...store,[child.id]:fn({...store[child.id]})})}/>;
 if(screen==='friends')return <Friends go={go} friends={friends} role="Parent" onUnfriend={unfriend}/>;
 if(screen==='profile')return <Profile go={go} child={child} account={account} balance={balance} goAllergies={()=>go('allergies')} updateChild={fn=>updateStore({...store,[child.id]:fn({...child})})} parent/>;
 if(screen==='settings')return <Settings go={go} child={child} updateChild={fn=>updateStore({...store,[child.id]:fn({...child})})}/>;
 if(screen==='assistance')return <MealAssistance go={go} child={child} parent/>;
 if(screen==='sendmeal')return <SendMeal go={go} foods={foods} add={add} child={child} safetyReason={safetyReason} stock={stock}/>;
 if(screen==='cart')return <Cart go={go} cart={cart.map(foodById).filter(Boolean)} remove={remove} total={total} safetyReason={safetyReason} completeOrder={completeOrder} unsafeCart={unsafeCart} stock={stock}/>;
 if(screen==='checkout')return <Checkout go={go} cart={cart.map(foodById).filter(Boolean)} total={total} balance={balance} points={child.points||0} toast={toast} completeOrder={completeOrder} stock={stock} friends={friends}/>;
 if(screen==='success')return <Success go={go} order={child.activeOrder}/>;
 if(screen==='order')return <OrderStatus go={go} child={child} updateChild={updateChild}/>;
 return null;}


function Friends({go,friends,role,onUnfriend}){const [selected,setSelected]=useState(null);const foodHistory=(selected?.history||[]).map(h=>({...h,food:foodById(h.foodId)})).filter(h=>h.food);const favoriteFoods=(selected?.favorites||[]).map(foodById).filter(Boolean);return <div className="screen"><PageHead title={role+' Friends'} go={go}/><div className="sync-banner">🤝 <b>Connected network</b><span>All demo {role.toLowerCase()} accounts are connected as friends.</span></div><div className="friends-grid">{friends.map(f=><button className="friend-card friend-card-button" key={f.id} onClick={()=>setSelected(f)}><img src={A+f.avatar}/><div><b>{f.name}</b><span>{role} · School ID {f.schoolId}</span></div><strong>✓ Friend</strong></button>)}</div>{selected&&<div className="friend-profile-backdrop" onClick={()=>setSelected(null)}><div className="friend-profile" onClick={e=>e.stopPropagation()}><div className="friend-profile-head"><img src={A+selected.avatar}/><div><h2>{selected.name}</h2><span>{role} · {selected.grade||'Student'}</span><small>School ID: {selected.schoolId}</small></div><button onClick={()=>setSelected(null)}>×</button></div><div className="friend-profile-stats"><div><b>{selected.points||0}</b><span>Points</span></div><div><b>{selected.history?.length||0}</b><span>Purchases</span></div><div><b>{selected.favorites?.length||0}</b><span>Favorites</span></div></div><section className="friend-profile-section"><h3>Favorites</h3>{favoriteFoods.length?<div className="friend-food-list">{favoriteFoods.map(f=><div key={f.id}><img src={A+f.img}/><span>{f.name}</span><b>₱{f.price}</b></div>)}</div>:<p className="muted">No favorite foods yet.</p>}</section><section className="friend-profile-section"><h3>Food History</h3>{foodHistory.length?<div className="friend-food-list history">{foodHistory.slice().reverse().map((h,i)=><div key={i}><img src={A+h.food.img}/><span>{h.food.name}<small>{h.date} · {h.time}</small></span><b>₱{h.food.price}</b></div>)}</div>:<p className="muted">No food purchases yet.</p>}</section><button className="danger-wide" onClick={()=>{onUnfriend(selected.id);setSelected(null)}}>Unfriend {selected.name.split(' ')[0]}</button></div></div>}</div>}
function Settings({go,child,updateChild}){const settings=child.settings||{notifications:true,orderUpdates:true,showAllergens:true};const set=(key,value)=>updateChild(c=>({...c,settings:{...(c.settings||settings),[key]:value}}));return <div className="screen"><PageHead title="Settings" go={go}/><div className="settings-card"><h3>Preferences</h3><button className="setting-row setting-button" onClick={()=>set('notifications',!settings.notifications)}><div><b>Notifications</b><small>Allow FlashFood reminders and updates</small></div><span>{settings.notifications?'ON':'OFF'}</span></button><button className="setting-row setting-button" onClick={()=>set('orderUpdates',!settings.orderUpdates)}><div><b>Order updates</b><small>Show pickup and order status messages</small></div><span>{settings.orderUpdates?'ON':'OFF'}</span></button><button className="setting-row setting-button" onClick={()=>set('showAllergens',!settings.showAllergens)}><div><b>Allergen warnings</b><small>Always show allergy information on food cards</small></div><span>{settings.showAllergens?'ON':'OFF'}</span></button></div><div className="settings-card"><h3>Accessibility</h3><div className="setting-row"><div><b>Motion</b><small>Animations respect your device's reduced-motion preference.</small></div><span>Auto</span></div><div className="setting-row"><div><b>Food safety</b><small>Allergy and restriction checks cannot be disabled.</small></div><span>Always on</span></div></div></div>}

function AllergySettings({go,child,title,description,updateChild}){
 const [custom,setCustom]=useState('');
 const toggle=a=>updateChild(c=>({...c,allergies:c.allergies.some(x=>normalizeAllergen(x)===normalizeAllergen(a))?c.allergies.filter(x=>normalizeAllergen(x)!==normalizeAllergen(a)):[...c.allergies,a]}));
 const addCustom=()=>{const value=custom.trim();if(!value)return;if(!child.allergies.some(x=>normalizeAllergen(x)===normalizeAllergen(value)))updateChild(c=>({...c,allergies:[...c.allergies,value]}));setCustom('')};
 return <div className="screen"><PageHead title={title} go={go}/><div className="safety-summary"><b>Automatic food safety is on</b><span>{description}</span></div><h3>Common allergens</h3><div className="allergy-options">{ALLERGENS.map(a=><button key={a} className={child.allergies.some(x=>normalizeAllergen(x)===normalizeAllergen(a))?'selected':''} onClick={()=>toggle(a)}>{child.allergies.some(x=>normalizeAllergen(x)===normalizeAllergen(a))?'✓ ':''}{a}</button>)}</div><h3>Add another allergy</h3><div className="custom-allergy"><input value={custom} onChange={e=>setCustom(e.target.value)} placeholder="e.g. Sesame" onKeyDown={e=>{if(e.key==='Enter')addCustom()}}/><button className="primary" onClick={addCustom}>Add</button></div><div className="allergy-current"><b>Current allergies</b>{child.allergies.length?<div className="allergy-tags">{child.allergies.map(a=><button key={a} onClick={()=>toggle(a)}>{a} ×</button>)}</div>:<span>None added</span>}</div><p className="muted">When an allergen is added, foods tagged with that allergen are automatically blocked from the menu, shared cart, and checkout.</p></div>
}

function Restrictions({go,foods,child,updateChild}){const toggleRestriction=id=>updateChild(c=>({...c,restrictions:c.restrictions.includes(id)?c.restrictions.filter(x=>x!==id):[...c.restrictions,id]}));return <div className="screen"><PageHead title="Food Restrictions" go={go}/><div className="safety-summary"><b>Child safety is enforced</b><span>{child.name.split(' ')[0]} cannot add restricted or allergen-containing food to the shared cart.</span></div><div className="allergy-link-card"><div><b>Allergies</b><span>{child.allergies.length?child.allergies.join(', '):'None added'}</span></div><button className="primary" onClick={()=>go('allergies')}>Manage allergies</button></div><h3>Restricted foods</h3><div className="restriction-list">{foods.map(f=><div className="restriction-row" key={f.id}><img src={A+f.img}/><div><b>{f.name}</b><small>₱{f.price}{f.allergens.length?` · Allergens: ${f.allergens.join(', ')}`:''}</small></div><button className={child.restrictions.includes(f.id)?'on':''} onClick={()=>toggleRestriction(f.id)}>{child.restrictions.includes(f.id)?'Restricted':'Allow'}</button></div>)}</div></div>}
function MealAssistance({go,child,parent}){const options=[{name:'Chicken Rice Meal',desc:'Balanced meal with rice, chicken and vegetables.',allergens:['Chicken'],nutrition:'Protein + vegetables'},{name:'Vegetable Rice Bowl',desc:'Rice, mixed vegetables and a light savory sauce.',allergens:['Gluten'],nutrition:'Vegetables + grains'},{name:'Arroz Caldo',desc:'Warm rice porridge with chicken and egg.',allergens:['Chicken','Eggs'],nutrition:'Protein + warm meal'}];return <div className="screen"><PageHead title="Meal Assistance" go={go}/><div className="assistance-hero"><span className="ai-badge">SDG 2 · ZERO HUNGER</span><h2>Everyone deserves a meal.</h2><p>These demo meal-support options represent school programs that can help students access food when cost or availability is a barrier.</p></div><div className="assistance-note">🥗 <b>Good health matters too.</b><span>FlashFood checks your allergy profile before showing meals as safe choices.</span></div><h3 className="section-title">Available support meals</h3><div className="assistance-list">{options.map((o,i)=><div className="assistance-option" key={o.name}><div className="assistance-icon">{i===0?'🍱':i===1?'🥗':'🍲'}</div><div className="assistance-copy"><b>{o.name}</b><span>{o.desc}</span><small>{o.nutrition} · No cost in this demo</small></div><button className="primary" onClick={()=>go('menu')}>View</button></div>)}</div><p className="muted">Demo feature for the pitch. In a real deployment, eligibility and meal funding would be managed by the school.</p></div>}

function SendMeal({go,foods,add,child,safetyReason,stock}){return <div className="screen"><PageHead title={`Buy for ${child.name.split(' ')[0]}`} go={go}/><div className="send-card"><img src={A+child.avatar}/><div><b>{child.name}</b><span>{child.grade} · School ID 67</span></div></div><p className="muted">Safety rules are enforced here too, so a parent cannot accidentally send an unsafe meal.</p><h3 className="section-title">Choose a meal</h3><div className="recommend-grid two">{foods.slice(0,6).map(f=><MiniFood key={f.id} food={f} add={()=>{if(add(f))go('cart')}} blocked={!!safetyReason(f)} favorite={child.favorites.includes(f.id)} stock={stock}/>)}</div></div>}
function MiniFood({food,add,blocked,favorite,stock}){return <div className={`mini-food ${blocked?'blocked':''}`}><div className="mini-img-wrap"><img src={A+food.img}/>{favorite&&<span>★</span>}</div><div><b>{food.name}</b><span>₱{food.price}</span></div><small className={(stock?.[food.id]??0)<=2?'stock-low':'stock-ok'}>{(stock?.[food.id]??0)>0?`${stock[food.id]} left`:'Out of stock'}</small><button disabled={blocked || (stock?.[food.id]??0)<=0} onClick={()=>add(food)}>{blocked?'🚫':'＋'}</button></div>}
function PageHead({title,go}){return <div className="page-head"><button onClick={()=>go('home')} className="back">←</button><h2>{title}</h2></div>}
function Empty({text,action}){return <div className="empty"><div>🛒</div><h3>{text}</h3><button className="primary" onClick={action}>Browse menu</button></div>}
function BottomNav({screen,go,role}){return <nav className="bottom"><div className="bottom-inner"><button className={screen==='map'?'active':''} onClick={()=>go('map')}>⌖<span>Map</span></button><button className={screen==='home'?'active':''} onClick={()=>go('home')}>◉<span>School ID: 67</span></button><button className={screen==='saved'?'active':''} onClick={()=>go('saved')}>◎<span>Saved Schools</span></button>{role==='student'&&<button className={screen==='history'?'active':''} onClick={()=>go('history')}>▤<span>History</span></button>}</div></nav>}

createRoot(document.getElementById('root')).render(<App/>);
