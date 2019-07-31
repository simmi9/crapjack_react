import React, { Component } from 'react'
import axios from 'axios'
import update from 'immutability-helper'

const Controls = ({bet,chips, makeBet, clearBet, dealClicked}) => {         
  return (
    <div>
      <div className="mid">
        <span className="numDisplay">Bet: {bet}</span>
      </div>
      <div className="mid">
        <span>
          <button onClick={() => makeBet(1)} 
            className={"bet"}>1</button>
          <button onClick={() => makeBet(5)} 
            className={"bet5"} >5</button>
          <button onClick={() => makeBet(10)} 
            className={"bet10"} >10</button>
        </span>
        <span>
        <button className={"btn"} 
             onClick={() => clearBet()}>Clear</button>
         <button className={"btn"} 
             onClick={() => dealClicked()}>Deal</button>
        </span>

        <div style={{marginTop: 30}}>
          <span className="totalDisplay">Chips:{chips}</span>    
        </div>
      </div>
    </div>
  );
};


class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      deck_id: '',
      player: [],
      playerTotal: 0,
      playerTotalAlt: 0,
      dealer: [],
      dealerTotal: 0,
      dealerTotalAlt: 0,
      bet: 0,  
      chips: 1000,
      gameMsg: null,
    }
  }

  whenNewDeckIsShuffled = async (count =2) => {
    // this will happen after state is updated

    // call the API for "Draw a Card"
    // -- draw two cards
    // -- make sure to supply the deck_id
    // -- console log the result to be sure it
    // -- works the way we want
    axios
      .get(
        `https://deckofcardsapi.com/api/deck/${  
          this.state.deck_id
        }/draw/?count=${count}`
      )
      .then(response => {
        console.log(response.data.cards)

        const newState = {
          player: update(this.state.player, { $push: response.data.cards })
        }

        this.setState(newState)
      })
    axios
      .get(
        `https://deckofcardsapi.com/api/deck/${
          this.state.deck_id
        }/draw/?count=${count}`
      )
      .then(response => {
        console.log(response.data.cards)

        const newState = {
          dealer: update(this.state.dealer, { $push: response.data.cards })
        }

        this.setState(newState)
      })
  }

  componentDidMount = () => {
    axios
      .get('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1')
      .then(response => {
        const newState = {
          deck_id: response.data.deck_id
        }

        this.setState(newState, this.whenNewDeckIsShuffled)
      })
  }


  makeBet = (betVal) => {
    this.setState(prevState => ({
      bet: prevState.bet + betVal,
      chips: prevState.chips - betVal
    }));
  };
        
  clearBet = () => {
    this.setState(prevState => ({
      bet: 0,
      chips: prevState.chips + prevState.bet
    }));
  };

  hitClicked = () => {
    let deck = this.state.deck_id;  
    let player = this.state.player   
    this.whenNewDeckIsShuffled(1)
    let prevState = this.state;

    this.setState(prevState => ({
      player: player,
      deck_id: deck,
    }), this.calcCards(), this.checkForBust());
  };

  calcCards = () => {
    this.setState({
       dealerTotal: this.calcCardTotal(this.state.dealer, false),
       dealerTotalAlt: this.calcCardTotal(this.state.dealer, true),
       playerTotal: this.calcCardTotal(this.state.player, false),
       playerTotalAlt: this.calcCardTotal(this.state.player, true),
    });
  };

  calcCardTotal = (cards, eleven) => {  
    let sum =  Object.keys(cards).reduce(function(total, card) {
      let key = Number(card);
      let cardVal = Number(cards[key].value);   
      if(!Number(cards[key].value)) {  
        if(cards[key].value === 'KING' ||'QUEEN' || 'JACK'){
          cardVal =10
        }
      } 
      cardVal = (cardVal === 1 && eleven) ? 11 : cardVal;
      return Number(total) + cardVal;    
   }, 0); 
   return sum;  
 };

    //check if player bust
  checkForBust = () => {
      let t1, t2, min, status = "";
      t1 = this.calcCardTotal(this.state.player, false);
      t2 = this.calcCardTotal(this.state.player, true);
      min = Math.min(t1, t2);
      if (min > 21) {
        status = "Player Bust!!!";
      }
      
      this.setState({
        gameMsg: status
      });
    };

  checkDealerStatus = (dealerCards, playerTotal) => {
      let t1, t2, status = "";
      
      t1 = this.calcCardTotal(dealerCards, false);
      t2 = this.calcCardTotal(dealerCards, true);    
      
      if (Math.min(t1, t2) > 21) {
        status = "Player Wins!!!";
      }
      else if ((t1 <= 21 && t1 === playerTotal) || (t2 <= 21 && t2 === playerTotal)) {
        status = "Push";
      }
      else if ((t1 <= 21 && t1 > playerTotal) || (t2 <= 21 && t2 > playerTotal)) {
        status = "Dealer wins!!!";
      }
       
      return status;
  };
   
  drawCards = (dealer, numberOfCards) => {
    let i;
    
    for (i = 1; i <= numberOfCards; i++) {
      axios
      .get(
        `https://deckofcardsapi.com/api/deck/${  
          this.state.deck_id
        }/draw/?count=1`
      )  
      .then(response =>{
        console.log(response.data.cards)

        const newState = {
          dealer: update(this.state.dealer, {$push: response.data.cards})  
        }
        this.setState(newState)
      })
    }

    return dealer;         
  }  


  stayClicked = () => {
      //Draw dealer cards until value equals or is higher then user.
      let playerTotal = Math.max(this.state.playerTotal, this.state.playerTotalAlt);
      if (playerTotal > 21)
        playerTotal = Math.min(this.state.playerTotal, this.state.playerTotalAlt);    
      this.whenNewDeckIsShuffled(1);
      let dealerCards = this.state.dealer;
      let status = this.checkDealerStatus(dealerCards, playerTotal);
      
      if (status === "") {
          do {
            this.drawCards(dealerCards, 1);
            status = this.checkDealerStatus(dealerCards, playerTotal);  
          }
          while(status === "");
      }
      
      this.setState(prevState => ({
        dealer: dealerCards,
        gameMsg: status,
      }), this.calcCards());
    };

    clearBet = () => {
      this.setState(prevState => ({
        bet: 0,
        chips: prevState.chips + prevState.bet
      }));
    };

  // Deal Cards         
  dealClicked = () => {
    
    let dealerCards = this.state.dealer;
    let playerCards = this.state.player;
    
    if (this.state.bet === 0) return;
    this.whenNewDeckIsShuffled(2) ;  
    
    this.setState(prevState => ({
      dealer: dealerCards,
      player: playerCards,    
    }), this.calcCards());
  };
     


    resetGame = async () => {
      let chips = this.state.chips;  
      let bet = this.state.bet;
      //Calculate chips
      if (this.state.gameMsg === "Push") {
        chips = chips + bet;
      }
      else if (this.state.gameMsg === "Player Wins!!!") {
        chips = chips + (bet * 2);  
      }
      
      axios
      .get('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1')
      .then(response => {
        const newState = {
          deck_id: response.data.deck_id
        }  
        this.setState({dealerTotal: 0,
          dealerTotalAlt: 0,
          dealer: [],
          playerTotal: 0,
          playerTotalAlt: 0,
          player: [],  
          bet: 0,
          chips: chips,
          gameMsg: null})

        this.setState(newState, this.whenNewDeckIsShuffled)
        
      })  
    }  

  
  render() {
    return (
      <>
        <h1>CrapJack</h1>
        <div className="center">
          <p className="game-results">{this.state.gameMsg ||"Test Your Skills!"}</p>    
        </div>
        <div className="center">
          <button className="reset" onClick={() => this.resetGame()}> Play Again!</button>
        </div>

        <div className="play-area">
          <div className="left">
            <button className="hit" onClick={() => this.hitClicked()} >Hit</button>          
            <p>Your Cards:</p>
            <p className="player-total">Total: {this.state.playerTotal || 0}</p>
            <div className="player-hand">
              {this.state.player.map((card, index) => {
                return <img key={index} src={card.images.png} alt="card" />
              })}
            </div>
          </div>

          <div className="right">
            <button className="stay" onClick={() => this.stayClicked()} >Stay</button>
            <p>Dealer Cards:</p>
            <p className="dealer-total">Total:{this.state.dealerTotal || 0}</p>      
            <div className="dealer-hand">  
              {this.state.dealer.map((card, index) => {
                return <img key={index} src={card.images.png} alt="card" />
              })}
            </div>  
          </div>
        </div>
        <Controls  bet={this.state.bet} 
                     chips={this.state.chips} 
                     makeBet={this.makeBet} 
                     clearBet={this.clearBet}
                     dealClicked={this.dealClicked}
                  />   
      </>
    )
  }
}

export default App;