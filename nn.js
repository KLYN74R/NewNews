#!/usr/bin/env node

import {BASE64,LOG,PATH_RESOLVE} from './NN_Space/utils.js'

import AdvancedCache from './NN_Essences/advancedcache.js'

import chalkAnimation from 'chalk-animation'

import UWS from 'uWebSockets.js'

import c from 'crypto'

import l from 'level'

import fs from 'fs'





/* OBLIGATORY PATH RESOLUTION*/
global.__dirname = await import('path').then(async mod=>
  
    mod.dirname(
      
      (await import('url')).fileURLToPath(import.meta.url)
      
    )

)


/*

*TODO:Provide async formatting ratings due to fair addresses and liars
!TODO:Ограничить время TCP сессии для fetch(через Promise.any и один из промисов таймер на заданое кол-во секунд)


*/


//_________________________________________________CONSTANTS_POOL_______________________________________________




//Check the Roadmap,documentation,official sources,etc. to get more | Смотрите Roadmap проекта,документацию,официальные источники и тд. чтобы узнать больше

export let
    
    dezCA=l(PATH_RESOLVE('M/DEZCA'),{valueEncoding:'json'}),//For different levels of anonymous NNDezCA | Для разных уровней проекта NNDezCA
    
    exchangeB=l(PATH_RESOLVE('M/EXCHANGE_B'),{valueEncoding:'json'}),//Contains containers of hashes of branches which weren't broadcasted to nodes from EXPORT_BRANCHCOMS
    
    exchangeS=l(PATH_RESOLVE('M/EXCHANGE_S'),{valueEncoding:'json'}),//The same as above but for fullnews(which are in "store" dbs)
    
    space=l(PATH_RESOLVE('M/SPACE'),{valueEncoding:'json'}),//To store zero level data of accounts i.e SpaceID,Roles flags,private nonce etc and data on different chains
    
    branchcom=l(PATH_RESOLVE('M/BRANCHCOMS')),//Branches of comments.Check the chapter Branchcoms
    
    store=l(PATH_RESOLVE('M/STORE')),//For alternative hrefs or fullnews(available for Information Empire),

    news={a:{},e:{}},//DBs of news.Both-ANY and ENPIRE
    



    FLUSH_ADVANCED_CACHE=()=>{

        //Do not pass params via arguments due to make labels shorter+not to make mistakes with values and references
        let cache=ACCOUNTS,
            
            shouldStop='CLEAR_TIMEOUT_ACCOUNTS_CACHE',
            
            stopLabel='STOP_FLUSH_ACCOUNTS_CACHE',
            
            {FLUSH_LIMIT,TTL}=CONFIG.CACHES.ACCOUNTS



        LOG('Going to flush accounts cache...','I')
  
        //Go through slice(from the beginning(least used) to <FLUSH_LIMIT>) of accounts in cache
        for(let i=0,l=Math.min(cache.cache.size,FLUSH_LIMIT);i<l;i++){
    
            let oldKey=cache.cache.keys().next().value,
                
                data=cache.cache.get(oldKey)
    
            //Immediately add key(address) to stoplist to prevent access and race condition while account's state are going to be written and commited(with current nonce etc.)
            cache.stoplist.add(oldKey)
                
            cache.cache.delete(oldKey)
            
            cache.db.put(oldKey,data).then(()=>cache.stoplist.delete(oldKey))
        
        }
    
        //We can dynamically change the time,limits,etc.
        global[stopLabel]=setTimeout(()=>FLUSH_ADVANCED_CACHE(),TTL)

        //Can be dynamically stopped
        global[shouldStop]&&clearTimeout(global[stopLabel])
    
    },

    //There is no ability to stop PERIOD function,coz it's part of process,so you can manipulate only by time
    PERIOD_START=async()=>{

        await dezCA.put('SNAPSHOT',SNAPSHOT)
    
            .then(()=>LOG(fs.readFileSync(PATH_RESOLVE('images/custom/snapshot.txt')).toString(),'S'))

            .catch(e=>{
        
                LOG(`Can't make snapshot\x1b[36;1m\n${e}\n`,'F')
        
                process.exit(103)
    
            })

        setTimeout(PERIOD_START,CONFIG.SNAPSHOT_PERIOD)

    },




    WRAP_RESPONSE=(a,ttl)=>a.writeHeader('Access-Control-Allow-Origin','*').writeHeader('Cache-Control','max-age='+ttl)



    
//_________________________________________________CONFIG_PROCESS_______________________________________________


//Define globally
global.CONFIG={}


//Load all configs
fs.readdirSync(PATH_RESOLVE('configs')).forEach(file=>
    
    Object.assign(CONFIG,JSON.parse(fs.readFileSync(PATH_RESOLVE(`configs/${file}`))))
    
)




//________________________________________________SHARED RESOURCES______________________________________________




global.PRIVATE_KEYS=new Map()

global.ACCOUNTS=new AdvancedCache(CONFIG.CACHES.ACCOUNTS.SIZE,space)//quick access to accounts in different chains and to fetch zero level data



//Load last snapshot file
global.SNAPSHOT=await dezCA.get('SNAPSHOT').catch(e=>JSON.parse(fs.readFileSync(PATH_RESOLVE('emptyshot.json'))))//if it's first time-than load empty file




//_____________________________________________NEWS PART PREPARATIONS___________________________________________




//Set newsbuffers
//Length 0 for buffers means that it's first init or some error has been occured
console.log(SNAPSHOT)
if(SNAPSHOT.ANY_NEWS_FREE.length===0) for(let i=1,l=CONFIG.ANY_NEWS_PERM;i<l;i++) SNAPSHOT.ANY_NEWS_FREE.push(i)
if(SNAPSHOT.EMP_NEWS_FREE.length===0) for(let i=1,l=CONFIG.EMP_NEWS_PERM;i<l;i++) SNAPSHOT.EMP_NEWS_FREE.push(i)




Object.keys(SNAPSHOT.ANY_TOPICS_CONTROL).forEach(topic=>news.a[topic]=l(PATH_RESOLVE(`A/${topic}`)))


if(CONFIG.EMPIRE.START){

    if(!SNAPSHOT.EMP_TOPICS_CONTROL) SNAPSHOT.EMP_TOPICS_CONTROL={}
    
    CONFIG.EMPIRE.TOPICS.forEach(topic=>{

        news.e[topic]=l(PATH_RESOLVE('E/'+topic))//define storage for each category in Information Empire

        SNAPSHOT.EMP_TOPICS_CONTROL[topic]||=[]

    })


}else{

    news.e={
        politics:l(PATH_RESOLVE('E/politics')),
        sport:l(PATH_RESOLVE('E/sport')),
        economy:l(PATH_RESOLVE('E/economy')),
        tech:l(PATH_RESOLVE('E/tech')),
        other:l(PATH_RESOLVE('E/other')),
        future:l(PATH_RESOLVE('E/future')),
        nature:l(PATH_RESOLVE('E/nature')),
        showbiz:l(PATH_RESOLVE('E/showbiz')),
        society:l(PATH_RESOLVE('E/society')),
    }
    
    //ANY_TOPICS_CONTROL is hardcoded into config file due to known set of topics <ANY>
    Object.keys(SNAPSHOT.ANY_TOPICS_CONTROL).forEach(topic=>SNAPSHOT.EMP_TOPICS_CONTROL[topic]=[])

}





/*
****************************************************************************************************************
*                                                                                                              *
*                                                                                                              *
*                                    ░██████╗████████╗░█████╗░██████╗░████████╗                                *
*                                    ██╔════╝╚══██╔══╝██╔══██╗██╔══██╗╚══██╔══╝                                *
*                                    ╚█████╗░░░░██║░░░███████║██████╔╝░░░██║░░░                                *
*                                    ░╚═══██╗░░░██║░░░██╔══██║██╔══██╗░░░██║░░░                                *
*                                    ██████╔╝░░░██║░░░██║░░██║██║░░██║░░░██║░░░                                *
*                                    ╚═════╝░░░░╚═╝░░░╚═╝░░╚═╝╚═╝░░╚═╝░░░╚═╝░░░                                *
*                                                                                                              *
*                                                                                                              *
****************************************************************************************************************
*/




(async()=>{




//_________________________________________________BANNERS INTRO________________________________________________




    process.stdout.write('\x1Bc')
        
    //Cool short animation
    await new Promise(r=>{
        
        let animation=chalkAnimation.rainbow('\x1b[31;1m'+fs.readFileSync(PATH_RESOLVE('images/intro.txt')).toString()+'\x1b[0m')
    
        setTimeout(()=>{ animation.stop() ; r() },CONFIG.ANIMATION_DURATION)
    
    })
    
    
    process.stdout.write('\x1Bc')
    
    //Read banner
    console.log('\x1b[36;1m'+fs.readFileSync(PATH_RESOLVE('images/banner.txt')).toString()
    
    //...and add extra colors & changes)
    .replace('Created by human beings','\x1b[31mCreated by human beings\x1b[36m')
    .replace('@ Powered by Klyntar @','@ Powered by \u001b[7m\u001b[31;5;219mKlyntar\x1b[0m \x1b[36;1m@')
    .replaceAll('≈','\x1b[31m≈\x1b[36m')
    .replaceAll('#','\x1b[31m#\x1b[36m')
    .replaceAll('*','\x1b[31m*\x1b[36m')
    .replaceAll('+','\x1b[31m+\x1b[36m')+'\x1b[0m\n')
        
        
    LOG(fs.readFileSync(PATH_RESOLVE('images/custom/start.txt')).toString(),'S')
    



//_____________________________________________ADVANCED PREPARATIONS____________________________________________


    
    global.GUID=BASE64(c.randomBytes(64))

    LOG(`Updated \x1b[36;1mGUID\x1b[32;1m is ———> \x1b[36;1m${GUID}`,'S')
    



    //Make this shit for memoization and not to repeate .stringify() within each request.Some kind of caching
    //BTW make it global to dynamically change it in the onther modules
    global.INFO=JSON.stringify({GUID,...CONFIG.INFO})



    
//_______________________________________________GET SERVER ROUTES______________________________________________




let {B}=await import('./NN_Routes/branchcoms.js'),
    {W}=await import('./NN_Routes/control.js'),
    {D}=await import('./NN_Routes/dezca.js'),
    {S}=await import('./NN_Routes/store.js'),
    {N}=await import('./NN_Routes/news.js'),
    {M}=await import('./NN_Routes/main.js'),
    {A}=await import('./NN_Routes/api.js')




//_____________________________________________START EXPORT PROCESSES___________________________________________

    /*

                                    Looks like "WTF,why not via function here?!"
        
        There are 3 cases:
            *For STORE and BRANCHCOMS
            *For ANY and EMP news
            *For accounts cache
        
        Each of this required 3 different logicflow and in the same time-we don't repeat such calls somewhere else
        Simultaneously,inside function we need additional logic(to define appropriate values-it's operations) while this way we increase efficiency
        So,it's irrational way to use function here 
    
    */
    
    global.BRANCHCOMS_CONTROL=[]
    global.STORE_CONTROL=[]



    //...to export alternative references and fullnews
    CONFIG.TRIGGERS.EXPORT_STORE
    &&
    setTimeout(()=>B.EXPORT_RESOURCES_START(STORE_CONTROL,'EXPORT_STORE',exchangeS,store,'/is','STOP_EXPORT_STORE'),CONFIG.EXPORT_STORE.DELAY)
    
    //...to export branches of comments
    CONFIG.TRIGGERS.EXPORT_BRANCHCOMS
    &&
    setTimeout(()=>B.EXPORT_RESOURCES_START(BRANCHCOMS_CONTROL,'EXPORT_BRANCHCOMS',exchangeB,branchcom,'/ibc','STOP_EXPORT_BRANCHCOMS'),CONFIG.EXPORT_BRANCHCOMS.DELAY)




    //!CONFIG.EXPORT_EMP_NEWS.SEND ---> удалять идентификаторы буфферов так же и отсюда когда чистим БД news локально(потому что значения что в БД что в отправленных буферах одинаковы)
    CONFIG.TRIGGERS.EXPORT_EMP_NEWS
    &&
    setTimeout(()=>N.EXPORT_NEWS_START('EMP',news.e,'/ie'),CONFIG.EXPORT_EMP_NEWS.DELAY)
    
    CONFIG.TRIGGERS.EXPORT_ANY_NEWS
    &&
    setTimeout(()=>N.EXPORT_NEWS_START('ANY',news.a,'/ia'),CONFIG.EXPORT_ANY_NEWS.DELAY)




    //...and start this stuff.Note-if TTL is 0-there won't be any auto flush.Also,there is ability to start this process further,in runtime,so let it be
    CONFIG.CACHES.ACCOUNTS.TTL!==0
    &&
    setTimeout(()=>FLUSH_ADVANCED_CACHE(),CONFIG.CACHES.ACCOUNTS.DELAY)


    

//____________________________________________INIT SNAPSHOTS PROCEDURE___________________________________________

    PERIOD_START();









//_____________________________________________________MAIN_____________________________________________________

//...And only after that we start routes

CONFIG.TLS_ENABLED?LOG('TLS is enabled!','S'):LOG('TLS is disabled','W')

UWS[CONFIG.TLS_ENABLED?'SSLApp':'App'](CONFIG.TLS_CONFIGS)


.post('/sd',M.startSpaceId)

.post('/sc',M.spaceChange)




//___________________________________________NEWS & BRANCHCOMS & STORE___________________________________________




.get('/dca/:adr',(a,q)=>

    WRAP_RESPONSE(a,'DEZ').onAborted(()=>a.aborted=true)
    &&
    dezCA.get(q.getParameter(0)).then(v=>
        
        !a.aborted&&a.end(v)
        
    ).catch(e=>!a.aborted&&a.end('DB error'))
    
)
        
.post('/dca',D.dezCA)



.post('/al',N.anyNewsList)

.post('/el',N.empNewsList)

.post('/ss',N.setOneSrc)

.post('/an',N.anyNews)

.post('/en',N.empNews)




.get('/a/:t/:n',N.getAnyNews)

.get('/e/:t/:n',N.getEmpNews)




.post('/ie',N.importEmpireNews)

.post('/ia',N.importAnyNews)




.get('/s/:hash',S.getStore)

.post('/is',S.importStore)

.post('/s1',S.stor1)
    
.post('/s2',S.stor2)




.post('/ibc',B.importBranchcoms)

.get('/b/:hash',B.getBranchcom)

.post('/c',B.comment)

.post('/ob',B.openBc)




//_____________________________________________________CONTROL_____________________________________________________


//.post('/change',W.change)

.post('/con',W.config)

//.post('/view',W.view)


//_______________________________________________________API_______________________________________________________


//Send address in hex format.Use Buffer.from('<YOUR ADDRESS>','base64').toString('hex')
.get('/local/:address',A.local)


.get('/i',A.info)





.listen(CONFIG.INTERFACE,CONFIG.PORT,ok=>
    
    ok ? LOG(`Node started on ———> \x1b[36;1m${CONFIG.INTERFACE}:${CONFIG.PORT}`,'S') : LOG('Oops,some problems with server module','F')
    
)




})()