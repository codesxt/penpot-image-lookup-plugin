penpot.ui.open("Image Lookup Plugin",`?theme=${penpot.theme}`,{width:450,height:650});penpot.on("themechange",e=>{n({type:"theme",content:e})});function n(e){penpot.ui.sendMessage(e)}
