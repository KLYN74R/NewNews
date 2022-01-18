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



import {SIG, VERIFY} from '../NN_Space/utils.js'
import {hash} from 'blake3-wasm'
import fetch from 'node-fetch'



let reserve={
    pub: '+i50zIUT4b7bRCgD2ggNCTTbXT9wER1olGriYUVyAgs=',
    prv: 'MC4CAQAwBQYDK2VwBCIEIIR8l5Gk0QVDzDvHO/549y7wb+Vqsxx9yZtzoVxnklp1'
},


BLAKE3=v=>hash(v).toString('hex'),


KEYPAIR={

    pub: 'EHYLgeLygJM21grIVDPhPgXZiTBF1xvl5p7lOapZ534=',
    prv: 'MC4CAQAwBQYDK2VwBCIEIKN4J4SGoeRJuZG3bisJbSQFmqSG7XC0HFqnbbqGLX3Q'

},











myAddress=KEYPAIR.pub,//Ed25519 public key in BASE64

chain='q0Bl2spIOIBhA5pviv6B69RdBcZls7iy+y4Wc3tgSVs=',//chain on which you wanna send tx

chainNonce=await fetch('http://localhost:7777/account/ab4065daca48388061039a6f8afe81ebd45d05c665b3b8b2fb2e16737b60495b/10760b81e2f2809336d60ac85433e13e05d9893045d71be5e69ee539aa59e77e')

.then(r=>r.json()).then(data=>data.N+1).catch(e=>{
    
    console.log(`Can't get chain level data`)
    
    //process.exit(121)

}),//nonce on appropriate chain



SID='V5nYl187DcrVVw2v8x+J3qMm7APkY78uVYHWNPzbZjbUH87T5ykVCvu/gqFnsqE1kYvDzfZM27kRDwe95+KQWA==',//SID of your address on this node


//SID for Controller -> V5nYl187DcrVVw2v8x+J3qMm7APkY78uVYHWNPzbZjbUH87T5ykVCvu/gqFnsqE1kYvDzfZM27kRDwe95+KQWA==
//EWOltYJJIYmoiQrkFinyNB37yiVRwIp1zeofWeMXCvKZk+6Dg7AQ8vR1wITRLjtafDIQsBi2SUl12GISI0vhmw==


//You can ask it at the beginning of interaction.Once you get GUID and nonce,you just increment nonce each transaction/news/any other data you send to node
//NOTE:GUID is changable so if you get an error after request-check GUID and localnonce agaijn

//unique value per instance run.Before send tx you can GET /info to get current GUID of node
{GUID}=await fetch('http://localhost:8888/i').then(r=>r.json()).catch(e=>{
    
    console.log(`Can't get GUID`)
    
    process.exit(120)//no sense to send smth which can't be accepted

}),



//nonce in ACCOUNTS of node
localNonce=await fetch(`http://localhost:8888/local/${Buffer.from(myAddress,'base64').toString('hex')}`).then(r=>r.text()).catch(e=>console.log(`Can't get LocalNonce`)),








news={

    t:'economy',
    h:'BLALBLALBLLBLBLALBLBALBLBALBL'

}


fetch('http://localhost:8888/an',

    {method:'POST',body:JSON.stringify(
        
        {
            c:myAddress,
        
            d:news,

            f:BLAKE3(news.t+news.h+SID+GUID+localNonce)
        
        }
    )}

).then(r=>r.text()).then(console.log)

















//____________________________________________________________________________ PAYLOADS ____________________________________________________________________________



// delegation_payload='QQQQQQQQQQQQQQQQ',//some transaction data.In this case-it's setting up delegate


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


// newsHash='012345678901234567890123456789012345678901234567890123456789ffff',


// tx={
//     c:myAddress,
//     r:reserve.pub,
//     a:55.06,
//     t:'@My own info@',
//     n:chainNonce,
//     s:await SIG(reserve.pub+'@My own info@'+55.06+chain+chainNonce,KEYPAIR.prv)
// }

// console.log(tx)

//console.log(await VERIFY(tx.r+tx.t+tx.a+chain+chainNonce,tx.s,tx.c))

// console.log('Initial localnonce ->', localNonce)

// console.log('Initial GUID is ->', GUID)




//------------------------------------------------------ ADDRESS <-> ADDRESS TX-----------------------------------------------------------

// await fetch('http://localhost:7777/tx',

//     {method:'POST',body:JSON.stringify(
        
//         {
//             f:BLAKE3(tx.r+tx.t+tx.a+chain+chainNonce+SID+GUID+localNonce),
        
//             d:[chain,tx]
        
//         }
//     )}

// ).then(r=>r.text()).then(x=>console.log('DefaultTx =>',x))



//-----------------------------------------------------------DELEGATION TX-----------------------------------------------------------


// chainNonce++
// localNonce++

// await fetch('http://localhost:7777/tx',

//     {method:'POST',body:JSON.stringify(
        
//         {
//             f:BLAKE3(delegation_payload+chain+chainNonce+SID+GUID+localNonce),
        
//             d:[chain,{c:myAddress,d:delegation_payload,n:chainNonce,s:await SIG(delegation_payload+chain+chainNonce,KEYPAIR.prv)}]
        
//         }
//     )}

// ).then(r=>r.text()).then(x=>console.log('DelegationTx =>',x))


//----------------------------------------------NewsTX-to store hash of news on Klyntar-------------------------------


// chainNonce++
// localNonce++


// await fetch('http://localhost:7777/tx',

//     {method:'POST',body:JSON.stringify(
        
//         {
//             f:BLAKE3(newsHash+chain+chainNonce+SID+GUID+localNonce),
        
//             d:[chain,{c:myAddress,h:newsHash,n:chainNonce,s:await SIG(newsHash+chain+chainNonce,KEYPAIR.prv)}]
        
//         }

//     )}

// ).then(r=>r.text()).then(x=>console.log('NewsTx =>',x))



//----------------------------------------------------------- Offspring creation -----------------------------------------------------------

// chainNonce++
// localNonce++



// await fetch('http://localhost:7777/tx',

//     {method:'POST',body:JSON.stringify(
        
//         {
//             f:BLAKE3(manifest+chain+chainNonce+SID+GUID+localNonce),
        
//             d:[chain,{c:myAddress,m:manifest,n:chainNonce,s:await SIG(manifest+chain+chainNonce,KEYPAIR.prv)}]
        
//         }

//     )}

// ).then(r=>r.text()).then(x=>console.log('OffspringTx =>',x))







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
_______________________________________________________Send D-transaction_______________________________________________________




fetch('http://localhost:7777/tx',

    {method:'POST',body:JSON.stringify(
        
        {
            f:BLAKE3(payload+chain+chainNonce+SID+GUID+localNonce),
        
            d:[chain,{c:myAddress,d:payload,n:chainNonce}]
        
        }
    )}

).then(r=>r.text()).then(console.log)


_______________________________________________________Send S-transaction_______________________________________________________



fetch('http://localhost:7777/tx',

    {method:'POST',body:JSON.stringify(
        
        {
            f:BLAKE3(payload+chain+chainNonce+SID+GUID+localNonce),
        
            d:[chain,{c:myAddress,d:payload,n:chainNonce,s:await SIG(payload+chain+chainNonce,KEYPAIR.prv)}]
        
        }
    )}

).then(r=>r.text()).then(console.log)


________________________________________________________With wrong creds______________________________________________________




fetch('http://localhost:7777/tx',

    {method:'POST',body:JSON.stringify(
        
        {
            f:BLAKE3(payload+chain+chainNonce+false.N+GUID+false.N),
        
            d:[chain,{c:'MCowBQYDK2VwAyEAQuRT68MB8NBP=',d:payload,n:chainNonce}]
        
        }
    )}

).then(r=>r.text()).then(response=>console.log('Was wrong accepted -> ',response!==''))




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