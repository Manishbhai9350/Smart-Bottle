import gsap from "gsap"
import { SplitText } from "gsap/SplitText"


const DefaultConfig = {
    linesClass:'heading-line',
    charsClass:'heading-char',
    wordsClass:'heading-word',
}


export function setupSplitedHeading(targets = [],config=DefaultConfig){
    return new SplitText(targets,config)
}

export function AnimateHeadings(HeadingLineOne,HeadingLineTwo,onComlete=()=>{}){
    const TL = gsap.timeline({delay:1,onComplete:() => {
        HeadingLineOne.classList.remove('heading-line-one')
        HeadingLineOne.classList.add('heading-line-two')
        HeadingLineTwo.classList.remove('heading-line-two')
        HeadingLineTwo.classList.add('heading-line-one')
        gsap.set(HeadingLineOne.querySelectorAll('.heading-char'),{
            y:'100%',
            onComplete(){
                onComlete() 
            }
        })
    }})
    TL.to(HeadingLineOne.querySelectorAll('.heading-char'),{
        y:'-100%',
        stagger:.07,
        duration:1,
    })
    TL.to(HeadingLineTwo.querySelectorAll('.heading-char'),{
        y:0,
        stagger:.07,
        duration:1,
    },'<')
    return TL;
}


export function AnimateCounters(CounterLineOne,CounterLineTwo,onComlete=()=>{},value=0,length){
    let TextValue = value.toString().split('')

    const CharLength = length || TextValue.length;
    if(TextValue.length < CharLength) {
        for(let i = 0; i < CharLength ; i++){
            if(!TextValue[i]) {
                TextValue.unshift('0')
            }
        }
    }
    TextValue = TextValue.join('')

    CounterLineTwo.querySelectorAll('.counter-char').forEach((Item,i) => {
        Item.innerText = TextValue[i]
    })

    const TL = gsap.timeline({delay:1,onComplete:() => {
        CounterLineOne.classList.remove('counter-line-one')
        CounterLineOne.classList.add('counter-line-two')
        CounterLineTwo.classList.remove('counter-line-two')
        CounterLineTwo.classList.add('counter-line-one')
        gsap.set(CounterLineOne.querySelectorAll('.counter-char'),{
            y:'100%',
            onComplete(){
                onComlete() 
            }
        })
    }})
    TL.to(CounterLineOne.querySelectorAll('.counter-char'),{
        y:'-100%',
        stagger:.07,
        duration:1,
    })
    TL.to(CounterLineTwo.querySelectorAll('.counter-char'),{
        y:0,
        stagger:.07,
        duration:1,
    },'<')
    return TL;
}



export function AnimateCounter(Current,Counters){
    const PI = (Current-1) < 0 ? (Current-1) + Counters.length : Current-1
    const PrevCounter = Counters[PI]
}