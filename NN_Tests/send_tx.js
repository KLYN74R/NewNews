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




import {SIG} from '../NN_Space/utils.js'
import {hash} from 'blake3-wasm'
import fetch from 'node-fetch'




let BLAKE3=v=>hash(v).toString('hex'),

KEYPAIR={

    pub: 'EHYLgeLygJM21grIVDPhPgXZiTBF1xvl5p7lOapZ534=',
    prv: 'MC4CAQAwBQYDK2VwBCIEIKN4J4SGoeRJuZG3bisJbSQFmqSG7XC0HFqnbbqGLX3Q'

},

myAddress=KEYPAIR.pub,//Ed25519 public key in BASE64

payload='IVAN_USHKOV',//some transaction data.In this case-it's setting up delegate

chain='q0Bl2spIOIBhA5pviv6B69RdBcZls7iy+y4Wc3tgSVs=',//chain on which you wanna send tx

// chainNonce=await fetch('http://localhost:7777/account/ab4065daca48388061039a6f8afe81ebd45d05c665b3b8b2fb2e16737b60495b/10760b81e2f2809336d60ac85433e13e05d9893045d71be5e69ee539aa59e77e')

// .then(r=>r.json()).then(data=>data.N+1).catch(e=>{
    
//     console.log(`Can't get chain level data`)
    
//     process.exit(121)

// }),//nonce on appropriate chain



SID='V5nYl187DcrVVw2v8x+J3qMm7APkY78uVYHWNPzbZjbUH87T5ykVCvu/gqFnsqE1kYvDzfZM27kRDwe95+KQWA==',//SID of your address on this node

//SID for Controller -> V5nYl187DcrVVw2v8x+J3qMm7APkY78uVYHWNPzbZjbUH87T5ykVCvu/gqFnsqE1kYvDzfZM27kRDwe95+KQWA==
//EWOltYJJIYmoiQrkFinyNB37yiVRwIp1zeofWeMXCvKZk+6Dg7AQ8vR1wITRLjtafDIQsBi2SUl12GISI0vhmw==



//You can ask it at the beginning of interaction.Once you get GUID and nonce,you just increment nonce each transaction/news/any other data you send to node
//NOTE:GUID is changable so if you get an error after request-check GUID and localnonce again

//unique value per instance run.Before send tx you can GET /info to get current GUID of node
{GUID}=await fetch('http://localhost:8888/i').then(r=>r.json()).catch(e=>{
    
    console.log(`Can't get GUID`)
    
    process.exit(120)//no sense to send smth which can't be accepted

}),




//nonce in ACCOUNTS of node
localNonce=await fetch(`http://localhost:8888/local/${Buffer.from(myAddress,'base64').toString('hex')}`).then(r=>r.text()).catch(e=>console.log(`Can't get LocalNonce`)),


manifest=JSON.stringify({

    HIVEMIND:["kNULL","CARNAGE","TOXIN","RIOT","AGONY"],
    
    HOSTCHAINS:{
        xrp:{
            TYPE:"0",
            ADDRESS:"rBcQ6Kd6j2bJWCKR986hC9mL1iRtpayHKR"
        },
        eth:{
            TYPE:"0",
            ADDRESS:"0xAa044a5249d93dC7C967B6d7A2E5f92c9810741A"
        },
        trx:{
            TYPE:"0",
            ADDRESS:"TENahJSzprBv27pDjZTuEiLnPeFJFTNXSB"
        }
    }
})

console.log('Localnonce ->', localNonce)

console.log('GUID is ->', GUID)



payload={
    c:myAddress,
    i:'COVID-19',
    r:'https://fsdfdsfgdlk.io/dsvmd;d,lkldl',//CSP style
    s:await SIG('COVID-19'+'https://fsdfdsfgdlk.io/dsvmd;d,lkldl',KEYPAIR.prv)
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






// let news={

//     t:'hacktivity',
//     h:'REVIL members are arrested in Russia_HAHSHSHHSSA:xss.io jo.mpkpokml'

// }


// fetch('http://localhost:8888/en',

//     {method:'POST',body:JSON.stringify(
        
//         {
//             c:myAddress,
        
//             d:news,

//             f:BLAKE3(news.t+news.h+SID+GUID+localNonce)
        
//         }
//     )}

// ).then(r=>r.text()).then(console.log)







// let news={

//     h:'Top government Ukraian sites were hacked by Russian associated adversaries groups Fancy Bear_aaaaaaaaaaaaaaaaaa:osvita.ua mynode.dasd qwerty.xyz'

// }


// let newsArr=[]

// for(let i=0;i<20;i++) newsArr.push(news)


// let body=['hacktivity',newsArr]



// fetch('http://localhost:8888/el',

//     {method:'POST',body:JSON.stringify(
        
//         {
//             c:myAddress,
        
//             d:body,

//             f:BLAKE3(JSON.stringify(body)+SID+GUID+localNonce)
        
//         }
//     )}

// ).then(r=>r.text()).then(console.log)








//Send manifest
// await fetch('http://localhost:7777/tx',

//     {method:'POST',body:JSON.stringify(
        
//         {
//             f:BLAKE3(manifest+chain+chainNonce+SID+GUID+localNonce),
        
//             d:[chain,{c:myAddress,m:manifest,n:chainNonce,s:await SIG(manifest+chain+chainNonce,KEYPAIR.prv)}]
        
//         }
//     )}

// ).then(r=>r.text()).then(console.log)



// chainNonce++
// localNonce++

//Send newstx(commit news to chain)
// await fetch('http://localhost:7777/tx',

//     {method:'POST',body:JSON.stringify(
        
//         {
//             f:BLAKE3('hashofnewshashofnewshashofnewshashofnewshashofnewshashofnews_000'+chain+chainNonce+SID+GUID+localNonce),
        
//             d:[chain,{c:myAddress,h:'hashofnewshashofnewshashofnewshashofnewshashofnewshashofnews_000',n:chainNonce,s:await SIG('hashofnewshashofnewshashofnewshashofnewshashofnewshashofnews_000'+chain+chainNonce,KEYPAIR.prv)}]
        
//         }
//     )}

// ).then(r=>r.text()).then(console.log)



// chainNonce++
// localNonce++

//{"B":998168,"N":916,"D":"IVAN_USHKOV0123456789101112131415161718192021222324252627282930313233343536373839404142434445464748495051525354555657585960616263646566676869707172737475767778798081828384858687888990919293949596979899100101102103104105106107108109110111112113114115116117118119120121122123124125126127128129130131132133134135136137138139140141142143144145146147148149150151152153154155156157158159160161162163164165166167168169170171172173174175176177178179180181182183184185186187188189190191192193194195196197198199","COLLAPSE":50}
//1116
//200
// console.log('ACCEPTED CHAINNONCE',chainNonce)
// console.log('ACCEPTED LOCALNONCE',localNonce)


// let txs=[]

// for(let i=0;i<10000;i++){
//     txs.push({
//         f:BLAKE3(payload+chain+chainNonce+SID+GUID+localNonce),
    
//         d:[chain,{c:myAddress,d:payload,n:chainNonce,s:await SIG(payload+chain+chainNonce,KEYPAIR.prv)}]
    
//     })

//     chainNonce++
//     localNonce++

// }


// //console.log(txs.forEach(tx=>console.log(tx)))



// for(let i=0;i<txs.length;i++){
    
//     await fetch('http://localhost:7777/tx',

//     {method:'POST',body:JSON.stringify(txs[i])}

//     ).then(r=>r.text()).then(console.log).catch(e=>console.log('ERROR OCCURED'))
    
// }


// for(let i=0;i<300;i++){
//     payload+=i
// //Set delegate
// console.log('SEQ ',i)





// await fetch('http://localhost:7777/tx',

//     {method:'POST',body:JSON.stringify(
        
//         {
//             f:BLAKE3(payload+chain+chainNonce+SID+GUID+localNonce),
        
//             d:[chain,{c:myAddress,d:payload,n:chainNonce,s:await SIG(payload+chain+chainNonce,KEYPAIR.prv)}]
        
//         }
//     )}

// ).then(r=>r.text()).then(data=>{
//     console.log(data)
//     chainNonce++
//     localNonce++
// }).catch(e=>
    
//     console.log('ERROR OCCURED')

// )

// console.log('SEQ ',i)

// }



//Ordinary account<->account transaction
// fetch('http://localhost:8888/tx',

//     {method:'POST',body:JSON.stringify(
        
//         {
//             f:BLAKE3('FbI83sPTc/C27K/vWbALi7IqxlOl5bXS6X8DyeKB/9c='+10000+chain+chainNonce+SID+GUID+localNonce),
//             //to+tag+amount+chain+nonce
//             d:[chain,{c:myAddress,r:'FbI83sPTc/C27K/vWbALi7IqxlOl5bXS6X8DyeKB/9c=',a:10000,t:'',n:chainNonce,s:await SIG('FbI83sPTc/C27K/vWbALi7IqxlOl5bXS6X8DyeKB/9c='+10000+chain+chainNonce,KEYPAIR.prv)}]
        
//         }
//     )}

// ).then(r=>r.text()).then(console.log)

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
    i:'Trump VS Biden - who wins?\nNew election day in NY',
    r:'https://fsdfdsfgdlk.io/dsvmd;d,lkldl',//CSP style
    s:'V5nYl187DcrVVw2v8x+J3qMm7APkY78uVYHWNPzbZjbUH87T5ykVCvu/gqFnsqE1kYvDzfZM27kRDwe95+KQWA=='
}



fetch('http://localhost:7777/s2',

    {method:'POST',body:JSON.stringify(
        
        {
        
            d:payload,

            f:BLAKE3(payload.i+payload.r+payload.s+SID+GUID+localNonce)
        
        }
    )}

).then(r=>r.text()).then(console.log)






_____________________________________________________Send Open Branchcom______________________________________________________





payload='aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'//hash of fullnews


fetch('http://localhost:7777/ob',

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

    'qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq',//hash of fullnews

    {c:myAddress,t:'Yeah,looks scary',s:'V5nYl187DcrVVw2v8x+J3qMm7APkY78uVYHWNPzbZjbUH87T5ykVCvu/gqFnsqE1kYvDzfZM27kRDwe95+KQWA=='}//comment object

]

fetch('http://localhost:7777/c',

    {method:'POST',body:JSON.stringify(
        
        {
            c:myAddress,

            d:payload,

            f:BLAKE3(payload[1].t+payload[1].s+SID+GUID+localNonce)
        
        }
    )}

).then(r=>r.text()).then(console.log)



*/