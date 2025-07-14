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


export function AnimateCounter(Current,Counters){
    const PI = (Current-1) < 0 ? (Current-1) + Counters.length : Current-1
    const PrevCounter = Counters[PI]
}