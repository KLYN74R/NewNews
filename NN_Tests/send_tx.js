/**
 * 
 * @Vlad@ Chernenko 23.07.-1
 * 
 * 
 *   To test different type of txs
 *   BTW,I've noticed that sequence:
 *   <payload+chain+chainNonce+SID+GUID+localNonce>
 *
 *   looks like OSI packets.Basically-nessesary data for node is SID+GUID+localnonce,
 *   while data requiered by specific chain is payload+chain+chainNonce
 *
 * 
 */



import {SIG,VERIFY} from '../NN_Space/utils.js'
import {hash} from 'blake3-wasm'
import fetch from 'node-fetch'



let reserve={
    pub: '0xAa044a5249d93dC7C967B6d7A2E5f92c9810741A',//'+i50zIUT4b7bRCgD2ggNCTTbXT9wER1olGriYUVyAgs=',
    prv: 'MC4CAQAwBQYDK2VwBCIEIIR8l5Gk0QVDzDvHO/549y7wb+Vqsxx9yZtzoVxnklp1'
},


BLAKE3=v=>hash(v).toString('hex'),


// KEYPAIR={

//     pub: 'EHYLgeLygJM21grIVDPhPgXZiTBF1xvl5p7lOapZ534=',
//     prv: 'MC4CAQAwBQYDK2VwBCIEIKN4J4SGoeRJuZG3bisJbSQFmqSG7XC0HFqnbbqGLX3Q'

// },

// KEYPAIR={

//     pub: 'RqtrnrLAdxpUkjqKS42RKbgN1ryXad3NeJrPTBZpdyVL',
//     prv: 'MC4CAQAwBQYDK2VwBCIEIPYUaz5sxAjrd9mLJX4NIJwlia2uE22zuDiRLs+INf2p'

// },

KEYPAIR={

    pub: 'FASj1powx5qF1J6MRmx1PB7NQp5mENYEukhyfaWoqzL9',
    prv: 'MC4CAQAwBQYDK2VwBCIEICwEjxQThyf3yfw+F9L4SRGcu/LgXrgppd1wb5PCIY6k'

},

// Map(2) {
//     'FASj1powx5qF1J6MRmx1PB7NQp5mENYEukhyfaWoqzL9' => 'MC4CAQAwBQYDK2VwBCIEICwEjxQThyf3yfw+F9L4SRGcu/LgXrgppd1wb5PCIY6k',
//     '' => ''
//   }


myAddress=KEYPAIR.pub,//Ed25519 public key in BASE64

symbiote='FASj1powx5qF1J6MRmx1PB7NQp5mENYEukhyfaWoqzL9',//chain on which you wanna send tx

chainNonce=await fetch(`http://localhost:7777/account/${symbiote}/${'0xAa044a5249d93dC7C967B6d7A2E5f92c9810741A'}`)

.then(r=>r.json()).then(data=>{

    console.log(data)

    return data.N+1

}).catch(e=>{
    
    console.log(`Can't get chain level data`)
    
    //process.exit(121)

})//nonce on appropriate chain



// payload={
//     r:reserve.pub,
//     a:55.06
// },


// event={
//     c:myAddress,
//     t:'TX',
//     n:chainNonce,
//     p:payload,
//     s:await SIG(JSON.stringify(payload)+symbiote+chainNonce+'TX',KEYPAIR.prv)
// }


// console.log(event)



// await fetch('http://localhost:7777/event',

//     {
        
//         method:'POST',
        
//         body:JSON.stringify({symbiote,event})
    
//     }

// ).then(r=>r.text()).then(x=>console.log('DefaultTx =>',x))





// news={

//     t:'economy',
//     h:'BLALBLALBLLBLBLALBLBALBLBALBL'

// }


// fetch('http://localhost:8888/an',

//     {method:'POST',body:JSON.stringify(
        
//         {
//             c:myAddress,
        
//             d:news,

//             f:BLAKE3(news.t+news.h+SID+GUID+localNonce)
        
//         }
//     )}

// ).then(r=>r.text()).then(console.log)

















//_______________________________________________________________ PAYLOADS ____________________________________________________________________________


// manifest=JSON.stringify({

//     HIVEMIND:["kNULL","CARNAGE","TOXIN","RIOT","AGONY"],
    
//     HOSTCHAINS:{
//         xrp:{
//             TYPE:"0",
//             ADDRESS:"rBcQ6Kd6j2bJWCKR986hC9mL1iRtpayHKR"
//         },
//         eth:{
//             TYPE:"0",
//             ADDRESS:"0xAa044a5249d93dC7C967B6d7A2E5f92c9810741A"
//         },
//         trx:{
//             TYPE:"0",
//             ADDRESS:"TENahJSzprBv27pDjZTuEiLnPeFJFTNXSB"
//         }
//     }
// }),


//------------------------------------------------------ ADDRESS <-> ADDRESS TX-----------------------------------------------------------


// payload={
//     r:reserve.pub,
//     a:55.06
// },


// event={
//     c:myAddress,
//     t:'TX',
//     n:chainNonce,
//     p:payload,
//     s:await SIG(JSON.stringify(payload)+symbiote+chainNonce+'TX',KEYPAIR.prv)
// }




// await fetch('http://localhost:7777/event',

//     {
        
//         method:'POST',
        
//         body:JSON.stringify({symbiote,event})
    
//     }

// ).then(r=>r.text()).then(x=>console.log('DefaultTx =>',x))





//-----------------------------------------------------------DELEGATION TX-----------------------------------------------------------


// payload='JA3KGJMXY3F5QWHJOXVXYZ5J4IELAK2RNEWUSJP7TLMUDRCCBOM72WRHGQ',

// event={
//     c:myAddress,
//     t:'DELEGATION',
//     n:chainNonce,
//     p:payload,
//     s:await SIG(JSON.stringify(payload)+symbiote+chainNonce+'DELEGATION',KEYPAIR.prv)
// }

// console.log(event)

// console.log(await VERIFY(JSON.stringify(payload)+symbiote+chainNonce+'DELEGATION',event.s,event.c))


//----------------------------------------------NewsTX-to store hash of news on Klyntar-------------------------------


// payload='<32 bytes hash>',

// event={
//     c:myAddress,
//     t:'NEWSTX',
//     n:chainNonce,
//     p:payload,
//     s:await SIG(JSON.stringify(payload)+symbiote+chainNonce+'NEWSTX',KEYPAIR.prv)
// }




//____________________________________________________________ STRESS TEST ____________________________________________________________


// let txs=[]

// for(let i=0;i<10000;i++){
//     txs.push({
//         f:BLAKE3(payload+chain+chainNonce+SID+GUID+localNonce),
    
//         d:[chain,{c:myAddress,d:payload,n:chainNonce,s:await SIG(payload+chain+chainNonce,KEYPAIR.prv)}]
    
//     })

//     chainNonce++
//     localNonce++

// }


//____________________________________________________________ STRESS TEST ____________________________________________________________


























/*



___________________________________________________________Send news__________________________________________________________





let news={

    t:'future',
    h:'HASH:http://somesource.io https://somehacksrc.com https://qqqqmfsdlfkmslmlsmlfsd.onion'

}


fetch('http://localhost:7777/an',

    {method:'POST',body:JSON.stringify(
        
        {
            c:myAddress,
        
            d:news,

            f:BLAKE3(news.t+news.h+SID+GUID+localNonce)
        
        }
    )}

).then(r=>r.text()).then(console.log)




_________________________________________________________Send newslist________________________________________________________




let news={

    h:'<TITLE AND HREFS FOR FULL NEWS>'

}


let newsArr=[]

for(let i=0;i<20;i++) newsArr.push(news)


let body=['tech',newsArr]



fetch('http://localhost:7777/al',

    {method:'POST',body:JSON.stringify(
        
        {
            c:myAddress,
        
            d:body,

            f:BLAKE3(JSON.stringify(body)+SID+GUID+localNonce)
        
        }
    )}

).then(r=>r.text()).then(console.log)





__________________________________________________________Send Source_________________________________________________________





let data=['a','politics','3','ZZZ:https://zzzzzzzzzzzzzzzzzzzz.com/4545']
let data=['a','future','2','FOR SECOND 222222']




fetch('http://localhost:7777/ss',

    {method:'POST',body:JSON.stringify(
        
        {
            
            f:BLAKE3(JSON.stringify(data)+SID+GUID+localNonce),
        
            d:data,

            c:myAddress
        
        }
    )}

).then(r=>r.text()).then(console.log)





_______________________________________________________Send store1 link_______________________________________________________





payload=['ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff','https://extralink.io/dsfdsgfdg']


fetch('http://localhost:7777/s1',

    {method:'POST',body:JSON.stringify(
        
        {
            c:myAddress,
        
            d:payload,

            f:BLAKE3(payload[0]+payload[1]+SID+GUID+localNonce)
        
        }
    )}

).then(r=>r.text()).then(console.log)





________________________________________________________Send fullnews_________________________________________________________




payload={
    c:myAddress,
    i:'TITLE_MLFKDMFLKGM vmfkdslkfmldksgnlkdfnglekfmlsdkfnlfmsalfmsdlfkmflksdmlsdmfsdlkfmalsfmwenlkrnwqlfmslkfsdngldsmflkdsfklsdfl',
    r:'https://fsdfdsfgdlk.io/dsvmd;d,lkldl',//CSP style
    s:await SIG('COVID-<i>19</i>'+'https://fsdfdsfgdlk.io/dsvmd;d,lkldl',KEYPAIR.prv)
}


console.log('News is available by hash -> ',BLAKE3(JSON.stringify(payload)))



fetch('http://localhost:8888/s2',

    {method:'POST',body:JSON.stringify(
        
        {
        
            d:payload,

            f:BLAKE3(payload.i+payload.r+payload.s+SID+GUID+localNonce)
        
        }
    )}

).then(r=>r.text()).then(console.log)







_____________________________________________________Send Open Branchcom______________________________________________________





payload='b39f516e97491ab02a56d0aeffc2e5fb96afdc00dbe055365e1c544eb42ae0b0'//hash of fullnews


fetch('http://localhost:8888/ob',

    {method:'POST',body:JSON.stringify(
        
        {
            c:myAddress,

            d:payload,

            f:BLAKE3(payload+SID+GUID+localNonce)
        
        }
    )}

).then(r=>r.text()).then(console.log)








________________________________________________________Send comment__________________________________________________________




payload=[

    'b39f516e97491ab02a56d0aeffc2e5fb96afdc00dbe055365e1c544eb42ae0b0',//hash of fullnews

    {c:myAddress,t:'Damn WTF👀',s:await SIG('Damn WTF👀',KEYPAIR.prv)}//comment object

]

fetch('http://localhost:8888/c',

    {method:'POST',body:JSON.stringify(
        
        {
            c:myAddress,

            d:payload,

            f:BLAKE3(payload[1].t+payload[1].s+SID+GUID+localNonce)
        
        }
    )}

).then(r=>r.text()).then(console.log)




*/