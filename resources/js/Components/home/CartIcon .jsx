import React, { useState, useContext, useEffect } from 'react';
import { useTheme } from '../../storage/ThemeContext';
import { CartContext } from '../../storage/CartContext';
import { router } from '@inertiajs/react';

const CartIcon = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { cart, dispatch } = useContext(CartContext);
  const { isDarkMode } = useTheme();
  const [total, setTotal] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [isCheckoutHovered, setIsCheckoutHovered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  const handleRemoveItem = (itemId) => {
    setIsAnimating(true);
    setTimeout(() => {
      dispatch({ type: 'REMOVE', id: itemId });
      setIsAnimating(false);
    }, 200);
  };

  useEffect(() => {
    setTotal(cart.reduce((acc, item) => acc + item.price, 0));
    setTotalItems(cart.length);
  }, [cart]);

  return (
    <>
      <style>{`
@keyframes elegantFadeIn{from{opacity:0;transform:translateY(20px) scale(0.95);filter:blur(4px)}to{opacity:1;transform:translateY(0) scale(1);filter:blur(0)}}
@keyframes smoothSlideIn{from{opacity:0;transform:translateX(30px) rotateY(15deg)}to{opacity:1;transform:translateX(0) rotateY(0deg)}}
@keyframes gentlePulse{0%,100%{transform:scale(1);box-shadow:0 8px 25px rgba(59,130,246,0.15)}50%{transform:scale(1.02);box-shadow:0 12px 35px rgba(59,130,246,0.25)}}
@keyframes elegantBounce{0%{transform:scale(0.3) rotate(-10deg);opacity:0}50%{transform:scale(1.1) rotate(5deg)}70%{transform:scale(0.95) rotate(-2deg)}100%{transform:scale(1) rotate(0deg);opacity:1}}
@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
.cart-scrollbar::-webkit-scrollbar{width:6px}
.cart-scrollbar::-webkit-scrollbar-track{background:${isDarkMode ? 'rgba(51,65,85,0.3)' : 'rgba(241,245,249,0.5)'};border-radius:10px}
.cart-scrollbar::-webkit-scrollbar-thumb{background:linear-gradient(to bottom,#3b82f6,#1d4ed8);border-radius:10px;border:1px solid rgba(59,130,246,0.2)}
.cart-scrollbar::-webkit-scrollbar-thumb:hover{background:linear-gradient(to bottom,#2563eb,#1e40af)}
.glass-effect{backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px)}
.shimmer-effect{background:linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent);background-size:200% 100%;animation:shimmer 2s infinite}
`}
      </style>
      
      <div style={{position:'relative',display:'inline-block'}} onClick={handleClick} role="button" tabIndex={0}>
        <div style={{background:isHovered?'linear-gradient(135deg,#1e40af 0%,#3b82f6 50%,#1d4ed8 100%)':'linear-gradient(135deg,#1d4ed8 0%,#3b82f6 50%,#2563eb 100%)',borderRadius:'50%',width:'56px',height:'56px',display:'flex',justifyContent:'center',alignItems:'center',position:'relative',cursor:'pointer',transition:'all 0.4s cubic-bezier(0.175,0.885,0.32,1.275)',transform:isHovered?'scale(1.1) translateY(-2px)':'scale(1)',boxShadow:isHovered?'0 20px 40px rgba(29,78,216,0.4), 0 0 0 4px rgba(59,130,246,0.1), inset 0 1px 0 rgba(255,255,255,0.2)':'0 10px 25px rgba(29,78,216,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',border:'2px solid rgba(255,255,255,0.1)',animation:totalItems>0?'gentlePulse 3s ease-in-out infinite':'none'}} className={isHovered?'shimmer-effect':''} onMouseEnter={()=>setIsHovered(true)} onMouseLeave={()=>setIsHovered(false)}>          
          <svg width="26" height="26" viewBox="0 0 24 24" fill="white" style={{filter:'drop-shadow(0 2px 8px rgba(0,0,0,0.3))',transition:'all 0.4s cubic-bezier(0.175,0.885,0.32,1.275)',transform:isHovered?'rotate(12deg) scale(1.1)':'rotate(0deg) scale(1)'}}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M6 2a1 1 0 0 1 .993 .883l.007 .117v1.068l13.071 .935a1 1 0 0 1 .929 1.024l-.01 .114l-1 7a1 1 0 0 1 -.877 .853l-.113 .006h-12v2h10a3 3 0 1 1 -2.995 3.176l-.005 -.176l.005 -.176c.017 -.288 .074 -.564 .166 -.824h-5.342a3 3 0 1 1 -5.824 1.176l-.005 -.176l.005 -.176a3.002 3.002 0 0 1 1.995 -2.654v-12.17h-1a1 1 0 0 1 -.993 -.883l-.007 -.117a1 1 0 0 1 .883 -.993l.117 -.007h2zm0 16a1 1 0 1 0 0 2a1 1 0 0 0 0 -2zm11 0a1 1 0 1 0 0 2a1 1 0 0 0 0 -2z"/></svg>
        </div>
        <div style={{background:totalItems>0?'linear-gradient(135deg,#dc2626 0%,#ef4444 50%,#f87171 100%)':'linear-gradient(135deg,#64748b 0%,#475569 100%)',color:'#ffffff',borderRadius:'50%',minWidth:'24px',height:'24px',display:'flex',justifyContent:'center',alignItems:'center',position:'absolute',top:'-3px',right:'-3px',fontSize:'12px',fontWeight:'800',border:'3px solid rgba(255,255,255,0.9)',boxShadow:totalItems>0?'0 6px 20px rgba(220,38,38,0.4), 0 0 0 2px rgba(220,38,38,0.1)':'0 4px 12px rgba(0,0,0,0.2)',animation:totalItems>0?'elegantBounce 0.6s cubic-bezier(0.175,0.885,0.32,1.275)':'none',transition:'all 0.3s cubic-bezier(0.175,0.885,0.32,1.275)',textShadow:'0 1px 2px rgba(0,0,0,0.3)'}}>{totalItems}</div>
        
        {isOpen && (
          <div style={{position:'absolute',right:0,top:'70px',width:'380px',maxWidth:'95vw',background:isDarkMode?'rgba(15,23,42,0.95)':'rgba(255,255,255,0.95)',color:isDarkMode?'#f1f5f9':'#1e293b',borderRadius:'24px',padding:'0',zIndex:1000,border:`1px solid ${isDarkMode?'rgba(59,130,246,0.2)':'rgba(59,130,246,0.15)'}`,boxShadow:isDarkMode?'0 25px 50px -12px rgba(0,0,0,0.8), 0 0 0 1px rgba(59,130,246,0.1), inset 0 1px 0 rgba(255,255,255,0.05)':'0 25px 50px -12px rgba(0,0,0,0.25), 0 0 0 1px rgba(59,130,246,0.1), inset 0 1px 0 rgba(255,255,255,0.8)',animation:'elegantFadeIn 0.4s cubic-bezier(0.175,0.885,0.32,1.275)',overflow:'hidden'}} className="glass-effect">
            <div style={{background:'linear-gradient(135deg,#1e40af 0%,#3b82f6 50%,#22c55e 100%)',padding:'20px 24px',color:'#ffffff',position:'relative',overflow:'hidden'}}>
              <div style={{position:'absolute',top:0,left:0,right:0,bottom:0,background:'linear-gradient(45deg,transparent 30%,rgba(255,255,255,0.1) 50%,transparent 70%)',transform:'translateX(-100%)',animation:'shimmer 3s infinite'}}/>
              <div style={{position:'relative',zIndex:1}}>
                <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'8px'}}>
                  <div style={{background:'rgba(255,255,255,0.2)',borderRadius:'12px',padding:'8px',display:'flex',alignItems:'center',justifyContent:'center'}}><span style={{fontSize:'20px'}}>🛒</span></div>
                  <div><h3 style={{margin:0,fontSize:'18px',fontWeight:'700',textShadow:'0 2px 4px rgba(0,0,0,0.2)',letterSpacing:'0.5px'}}>Mi Carrito</h3><p style={{margin:'2px 0 0 0',fontSize:'13px',opacity:0.9,fontWeight:'500'}}>{totalItems} {totalItems===1?'artículo seleccionado':'artículos seleccionados'}</p></div>
                </div>
              </div>
            </div>

            <div style={{padding:'8px 0'}}>
              {cart.length===0?(
                <div style={{padding:'40px 24px',textAlign:'center',animation:'elegantFadeIn 0.5s ease-out'}}>
                  <div style={{fontSize:'64px',marginBottom:'16px',opacity:0.6,filter:'grayscale(0.3)'}}>🛍️</div>
                  <h4 style={{margin:'0 0 8px 0',fontSize:'18px',fontWeight:'600',color:isDarkMode?'#cbd5e1':'#475569',letterSpacing:'0.3px'}}>Tu carrito está vacío</h4>
                  <p style={{margin:'0 auto',fontSize:'14px',color:isDarkMode?'#94a3b8':'#64748b',lineHeight:'1.5',maxWidth:'250px'}}>Explora nuestros productos y agrega los que más te gusten</p>
                </div>
              ):(
                <>
                  <div className="cart-scrollbar" style={{maxHeight:'280px',overflowY:'auto',padding:'0 8px'}}>
                    {cart.map((item,index)=>(
                      <div key={item.id} style={{margin:'8px 16px',padding:'18px',background:isDarkMode?(hoveredItem===item.id?'linear-gradient(135deg,rgba(51,65,85,0.8) 0%,rgba(30,41,59,0.9) 100%)':'linear-gradient(135deg,rgba(42,52,65,0.6) 0%,rgba(30,41,59,0.7) 100%)'):(hoveredItem===item.id?'linear-gradient(135deg,rgba(248,250,252,0.9) 0%,rgba(241,245,249,1) 100%)':'linear-gradient(135deg,rgba(255,255,255,0.8) 0%,rgba(248,250,252,0.9) 100%)'),borderRadius:'16px',border:`2px solid ${hoveredItem===item.id?'rgba(59,130,246,0.4)':'rgba(59,130,246,0.1)'}`,transition:'all 0.3s cubic-bezier(0.175,0.885,0.32,1.275)',animation:`smoothSlideIn 0.4s cubic-bezier(0.175,0.885,0.32,1.275) ${index*0.08}s both`,transform:hoveredItem===item.id?'translateY(-2px) scale(1.02)':'translateY(0) scale(1)',boxShadow:hoveredItem===item.id?'0 12px 30px rgba(59,130,246,0.15)':'0 4px 15px rgba(0,0,0,0.05)'}} onMouseEnter={()=>setHoveredItem(item.id)} onMouseLeave={()=>setHoveredItem(null)}>
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'16px'}}>
                          <div style={{flex:1,minWidth:0}}>
                            <h5 style={{fontWeight:'700',fontSize:'15px',margin:'0 0 8px 0',color:isDarkMode?'#f1f5f9':'#1e293b',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',letterSpacing:'0.3px'}}>{item.title}</h5>
                            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:'13px'}}>
                              <span style={{fontWeight:'800',fontSize:'16px',background:'linear-gradient(135deg,#22c55e 0%,#16a34a 100%)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>S/ {item.price?item.price.toFixed(2):'0.00'}</span>
                            </div>
                          </div>
                          <button onClick={(e)=>{e.stopPropagation();handleRemoveItem(item.id);}} style={{background:hoveredItem===item.id?'linear-gradient(135deg,#ef4444 0%,#dc2626 100%)':'linear-gradient(135deg,#f87171 0%,#ef4444 100%)',color:'white',border:'none',borderRadius:'50%',width:'32px',height:'32px',cursor:'pointer',fontSize:'18px',display:'flex',justifyContent:'center',alignItems:'center',flexShrink:0,transition:'all 0.3s cubic-bezier(0.175,0.885,0.32,1.275)',transform:hoveredItem===item.id?'scale(1.1) rotate(90deg)':'scale(1) rotate(0deg)',boxShadow:hoveredItem===item.id?'0 8px 20px rgba(239,68,68,0.4)':'0 4px 12px rgba(239,68,68,0.2)'}} title="Eliminar producto">×</button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{padding:'20px 24px',background:isDarkMode?'rgba(15,23,42,0.7)':'rgba(248,250,252,0.9)',borderTop:'1px solid rgba(59,130,246,0.2)'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'18px',padding:'16px 20px',background:isDarkMode?'linear-gradient(135deg,rgba(42,52,65,0.8) 0%,rgba(30,41,59,0.9) 100%)':'linear-gradient(135deg,rgba(255,255,255,0.9) 0%,rgba(248,250,252,1) 100%)',borderRadius:'16px',border:'2px solid rgba(59,130,246,0.2)',boxShadow:'0 8px 25px rgba(59,130,246,0.1)'}}>
                      <span style={{fontSize:'18px',fontWeight:'600',color:isDarkMode?'#cbd5e1':'#374151',letterSpacing:'0.3px'}}>Total:</span>
                      <span style={{fontSize:'24px',fontWeight:'900',background:'linear-gradient(135deg,#22c55e 0%,#16a34a 100%)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',letterSpacing:'0.5px'}}>S/ {total.toFixed(2)}</span>
                    </div>
                    <button onClick={(e)=>{e.stopPropagation();router.visit('/carrito');}} onMouseEnter={()=>setIsCheckoutHovered(true)} onMouseLeave={()=>setIsCheckoutHovered(false)} style={{background:cart.length===0?'linear-gradient(135deg,rgba(100,116,139,0.5) 0%,rgba(71,85,105,0.6) 100%)':'linear-gradient(to bottom,#3b82f6,#1d4ed8)',color:cart.length===0?(isDarkMode?'#64748b':'#94a3b8'):'#ffffff',padding:'16px 24px',border:'none',borderRadius:'16px',width:'100%',fontSize:'16px',fontWeight:'700',cursor:cart.length===0?'not-allowed':'pointer',transition:'all 0.4s cubic-bezier(0.175,0.885,0.32,1.275)',transform:cart.length>0&&isCheckoutHovered?'translateY(-2px) scale(1.02)':'translateY(0) scale(1)',boxShadow:cart.length>0&&isCheckoutHovered?'0 12px 35px rgba(34,197,94,0.4), 0 0 0 2px rgba(34,197,94,0.1)':(cart.length>0?'0 8px 25px rgba(34,197,94,0.2)':'none'),letterSpacing:'0.5px',opacity:cart.length===0?0.6:1,pointerEvents:cart.length===0?'none':'auto',textShadow:cart.length>0?'0 2px 4px rgba(0,0,0,0.2)':'none',position:'relative',overflow:'hidden'}} disabled={cart.length===0}>
                      {cart.length>0&&isCheckoutHovered&&(<div style={{position:'absolute',top:0,left:0,right:0,bottom:0,background:'linear-gradient(45deg,transparent 30%,rgba(255,255,255,0.1) 50%,transparent 70%)',transform:'translateX(-100%)',animation:'shimmer 1s ease-out'}}/>)}
                      <span style={{position:'relative',zIndex:1}}>{cart.length===0?'🔒 CARRITO VACÍO':' FINALIZAR PEDIDO'}</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CartIcon;