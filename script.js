let score =JSON.parse( localStorage.getItem('score'))||{wins:0,losses:0,ties:0};

function updateScore(){
    document.querySelector(".score").innerHTML =`Wins:${score.wins} - Losses:${score.losses} - Ties:${score.ties}`;
}
function comMove(){
    const ranvalue = Math.random();
            let ComputerMove = '';
            if (ranvalue>=0 && ranvalue<1/3)
            {
                ComputerMove = 'Rock';
            }
            else if (ranvalue>=1/3 && ranvalue<2/3)
            {
                ComputerMove = 'Paper';
            }
            else if (ranvalue>=2/3 && ranvalue<1)
            {
                ComputerMove= 'Scissor';
            }
            return ComputerMove;
}
function RPS(op){
    
    let result ='';
    const ranvalue = Math.random();
            let ComputerMove = '';
            if (ranvalue>=0 && ranvalue<1/3)
            {
                ComputerMove = 'Rock';
            }
            else if (ranvalue>=1/3 && ranvalue<2/3)
            {
                ComputerMove = 'Paper';
            }
            else if (ranvalue>=2/3 && ranvalue<1)
            {
                ComputerMove= 'Scissor';
            }
    if (op === 'Rock'){
        

        if (ComputerMove === 'Rock'){
            result='Tie';
        }
        else if(ComputerMove ==='Paper')
        {
            result = 'you lose';
        }
        else if(ComputerMove ==='Scissor')
        {
            result = 'you win';
        }
        
    }
    else if (op ==='Paper'){
            
        if (ComputerMove === 'Rock'){
            result='you win';
        }
        else if(ComputerMove ==='Paper')
        {
            result = 'Tie';
        }
        else if(ComputerMove ==='Scissor')
        {
            result = 'you lose';
        }
    }
    else if(op ==='Scissor'){
        if (ComputerMove === 'Rock'){
            result='you lose';
        }
        else if(ComputerMove ==='Paper')
        {
            result = 'you win';
        }
        else if(ComputerMove ==='Scissor')
        {
            result = 'Tie';
        }
    }

    if (result==='you win'){
        score.wins+=1;
    }
    else if (result==='you lose'){
        score.losses+=1;
    }
    else if(result==='Tie'){
        score.ties+=1;
    }

    localStorage.setItem('score',JSON.stringify(score));

        updateScore()
    document.querySelector(".results").innerHTML= result;     
    document.querySelector(".hand").innerHTML =`
                    <div>
                        <h3>You</h3>
                        <img src="${op}-emoji.png" alt=""></div>
                    <div>
                        <h3>Computer</h3><img src="${ComputerMove}-emoji.png" alt=""></div>`;

}

function reset(){
    score.wins=0;
    score.losses=0;
    score.ties=0;
    localStorage.removeItem('score');
    updateScore();
}
let isAutoPlay = false;
let IntervalID 
function AutoPlay(){
    if (!isAutoPlay){
       IntervalID = setInterval(function(){
            const PlayerMove = comMove();
            RPS(PlayerMove);
        },1000);
        isAutoPlay = true;
    }
   else{
    clearInterval(IntervalID);
    isAutoPlay = false;
   }
}