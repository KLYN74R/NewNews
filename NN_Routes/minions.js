import {ACC_CONTROL,BODY,MINION} from '../NN_Space/utils.js'




export let Z={


//Сюда про запросы на другие узлы,проверку Integrity и тд
//_____________________________________________________MINIONS____________________________________________________
    

    
    
    getResources:a=>a.writeHeader('Access-Control-Allow-Origin','*').onAborted(()=>{}).onData(async v=>{
            
        let body=await BODY(v,CONFIG.PAYLOAD_SIZE)
        
        if(typeof body.c==='string'&&typeof body.f==='string'&&await ACC_CONTROL(body.c,'1',body.f,1,0,MINION,0)){
    
        }else a.end('')
    
    }),
    
    
    
    
    minionsVerify:a=>a.writeHeader('Access-Control-Allow-Origin','*').onAborted(()=>{}).onData(async v=>{
        
        let body=await BODY(v,CONFIG.PAYLOAD_SIZE)
        
        if(typeof body.c==='string'&&typeof body.f==='string'&&await ACC_CONTROL(body.c,'1',body.f,1,0,MINION,0)){
    
        }else a.end('')
    
    }),
    
    


    ord:a=>a.writeHeader('Access-Control-Allow-Origin','*').onAborted(()=>{}).onData(async v=>{

        let body=await BODY(v,CONFIG.PAYLOAD_SIZE)

        if(typeof body.c==='string'&&typeof body.f==='string'&&await ACC_CONTROL(body.c,'1',body.f,1,0,MINION,0)){

        }else a.end('')

    })

}