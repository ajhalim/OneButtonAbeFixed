title = "Number Boss Rush";

description = `
[Tap]  Zero
[Hold] One
`;

characters = []; // for sprites (none atm)

const G = {
	WIDTH: 100,
	HEIGHT: 100
};

options = {
	viewSize: {x: G.WIDTH, y: G.HEIGHT},
	isPlayingBgm: true,
	theme: "crt"
};

// constants
const questionTime = 600;
const maxTime = 2000;
const holdTime = 10;

// variables
let isPressing;		// checking if button is held
let held; 			// counts how long button is held, to differentiate dots and dashes
let nextQ;			// check to ask next question
let timeout;		// keeping track of time till timeout into next question
let answer; 		// player input
let correctAnswer;	// what input should match
let binaryTxt;		// display text in binary
let b10Txt;			// display text in base 10
let playerHitPoints;// player hp, if hit zero, player loses
let bossHitPoints	// boss hp, if hit zero player wins
let playerAtk		// player damage, when they answer correctly they reduce boss hp by this variable
let combo			// player combo, everytime the player succeeds up combo score, if they fail reset combo. combo impacts playerAtk
let time

// difficulty = digits
function binaryArrayToStr(arr) { // function for printing arrays without commas
	let s = "";
	for (let i = 0; i < arr.length; i++) {
		s = s.concat(String(arr[i]));
		s = s.concat(" ");
	}
	return s;
}
function Generator(digits){ // generates a number and saves it in str form to binaryTxt as binary and b10Txt as base 10
	let resD = 0;
	for(let x in range(digits)){
		correctAnswer[parseInt(x)] = floor(Math.random()*2);
		resD += correctAnswer[parseInt(x)] * Math.pow(2, digits - parseInt(x) - 1);
	}
	//txt = String(resD);
	binaryTxt = binaryArrayToStr(correctAnswer);
	b10Txt = String(resD);
}



function update() {
	if (!ticks) { // Initialize variables
		isPressing = false;
		held = 0;
		nextQ = true;
		timeout = 0;
		answer = [];
		correctAnswer = [];
		binaryTxt = "testing";
		playerHitPoints = 3;
		bossHitPoints = 100;
		playerAtk = 5;
		combo = 1;
		time = 0;
	}
	// Gen prompt
	if (nextQ) {
		/*timeout += questionTime; // if you want question time to carry over
		if (timeout > maxTime) {
			timeout = maxTime;
		}*/
		timeout = questionTime;
		// ask question
		Generator(5);
		console.log(b10Txt);
		console.log(binaryTxt);
		console.log(correctAnswer);
		nextQ = false;

		//combo = score;

		playerAtk = playerAtk * combo;
	}

	color("blue");
	line(vec(0, 10), vec(timeout*100/questionTime, 10)); // timeout bar
	text(String(floor(timeout*10/60)/10), vec(G.WIDTH/2-15, 4)); // timeout number


	color("red");
	line(vec(0, G.HEIGHT*2/4), vec((bossHitPoints), G.HEIGHT*2/4)); // bossHP
	text("Boss Health", vec(G.WIDTH/5, G.HEIGHT/2.5) ); // bossHP

	color("black");
	text(b10Txt, vec(5, G.HEIGHT/4)); // question
	color("light_black");
	text(":", vec(15, G.HEIGHT/4));
	color("black");
	text(binaryTxt, vec(G.WIDTH/4, G.HEIGHT/4));
	text(binaryArrayToStr(answer), vec(G.WIDTH/4, G.HEIGHT/2 + 10)); // input so far

	color("blue");
	line(vec(0, G.HEIGHT*3/4), vec(G.WIDTH, G.HEIGHT*3/4)); // separator line for cancel area
	text("Cancel", vec(G.WIDTH/2-16, G.HEIGHT*7/8)); // cancel text


	color("green");
	text("HP", vec(G.WIDTH/16, G.HEIGHT*7/8)); // HP
	text(String(playerHitPoints), vec(G.WIDTH/16, G.HEIGHT*9.5/10));

	color("black");
	text(String(time), vec(G.WIDTH*.80, G.HEIGHT*9.5/10));

	//text("Victory", vec(G.WIDTH/3.2, G.HEIGHT/2));
	//text(String(time), vec(G.WIDTH/2.25, G.HEIGHT/1.7))

	if(playerHitPoints <= 0){
		end();
	}

	if(isPressing) { // indicator that youve held long enough
		if(input.pos.y > G.HEIGHT*3/4) {
			color("light_red");
			bar(input.pos.x, input.pos.y, 14, 3, Math.PI/4);
			bar(input.pos.x, input.pos.y, 14, 3, -Math.PI/4);
		} else {
			if (held > holdTime) {
				color("yellow");
				//box(vec(input.pos), 10);
				//arc(input.pos.x, input.pos.y, 6, 3);
				bar(input.pos.x, input.pos.y, 10, 3, Math.PI/2);
			} else {
				color("cyan");
				//box(vec(input.pos), 10);
				arc(input.pos.x, input.pos.y, 6, 3);
			}
		}
	}

	// Input Handling
	if (input.isJustPressed) {
		isPressing = true;
		held = 0;
	}
	held += 1;
	/*if (!isPressing && held > holdTime) {
		// third kind of input: pause between inputs (ie for breaks btwn morse letters)
		// note that you'll have to make a variable that makes sure it only registers the pause once
	}*/
	if (input.isJustReleased) {
		isPressing = false;
		if(input.pos.y > G.HEIGHT*3/4) { // cancel input
			console.log("canceled");
			play("coin");
			answer = [];
		} else {
			if (held > holdTime) { //held
				console.log("held");
				console.log(held);
				play("laser");
				answer.push(1);
			} else { //tapped
				play("select");
				console.log("tapped");
				console.log(held);
				answer.push(0);
			}
		}
		console.log(answer);
	}

	if (answer.length == 5) { // Check if answer correct
		let correct = true;
		// compare to correct answer
		for (let i = 0; i < answer.length; i++) {
			if (answer[i] != correctAnswer[i]) {
				correct = false;
			}
		}
		if (correct) {
			nextQ = true;
			//console.log("YIPPEEE!");
			play("powerUp");
			score += timeout/200;
			combo = combo + timeout/200;

			bossHitPoints = bossHitPoints - playerAtk


			if(bossHitPoints <= 0){
				end();

				color("black");
				text("Victory", vec(G.WIDTH/3.5, G.HEIGHT*.75));
				text(String(time), vec(G.WIDTH/2.25, G.HEIGHT/1.5))
				
			}
			
			//dsadsadsa
		} else {
			play("explosion");

			playerHitPoints--;
			combo = 1;
			score = 1;
			//console.log("YUH OH!");
		}
		// empty answer
		answer = [];
	}
	if (timeout <= 0) { // Check if prompt timed out
		playerHitPoints -= 1;
		combo = 1;
		score =1;

		
		//end();
		//nextQ = true;
		//answer = [];
	} else {
		timeout -= 1;
		time++;
	}
}
