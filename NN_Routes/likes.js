import {ACC_CONTROL,BODY,PATH_RESOLVE,PRIVIL} from '../NN_Space/utils.js'

import {likes} from '../nn.js'

import fs from 'fs'




let LIKENEWSBUF={a:{politics:[],sport:[],economy:[],tech:[],other:[],future:[],showbiz:[],society:[],nature:[]},e:{}}




if(fs.existsSync(PATH_RESOLVE('empireconfig.json'))){
    
    let cat=JSON.parse(fs.readFileSync(PATH_RESOLVE('empireconfig.json')))

    for(let i=0,l=cat.L.length;i<l;i++)LIKENEWSBUF.e[cat.L[i]]=[]
    
}else LIKENEWSBUF.e={politics:[],sport:[],economy:[],tech:[],other:[],future:[],showbiz:[],society:[],nature:[]}


export let L={
    //Массив такой же как и для транзакций(кэш чтоб не записывать часто) и когда накопился лимит ложим в обычные news под приоритетными id но в рандомные места
    //Like  --->  News
    anyLikes:a=>a.writeHeader('Access-Control-Allow-Origin','*').onAborted(()=>{}).onData(async v=>{

        let b=await BODY(v,CONFIG.PAYLOAD_SIZE)
        
        likes.get(b.c).then(async v=>{
            if(v>0){
                //REALIZATION
            }
            a.end('1')
        
        }).catch(e=>a.end(''))

    }),
    



    empLikes:a=>a.writeHeader('Access-Control-Allow-Origin','*').onAborted(()=>{}).onData(async v=>{
        
        let b=await BODY(v,CONFIG.PAYLOAD_SIZE)
       
        typeof b.c==='string'&&typeof b.f==='string'
        ?
        likes.get(b.c).then(async v=>{
            if(v>0&&await ACC_CONTROL(b.c,JSON.stringify(b.d),b.f,1,1,PRIVIL)){
                //REALIZATION
            }
            a.end()
        }).catch(e=>a.end(''))
        :
        a.end('')

    }),




    likeList:a=>a.writeHeader('Access-Control-Allow-Origin','*').onAborted(()=>{}).onData(async v=>{
        
    })

}