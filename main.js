"use strict";
(()=>{
// 作成日 2022/7/05
// 公開日 2022/7/13
// 最終更新日 2022/8/22

// クロスブラウザ対応
window.AudioContext = window.AudioContext || window.webkitAudioContext;
const requestFullscreen = (f=>f.call.bind(f))(Element.prototype.requestFullscreen||Element.prototype.mozRequestFullScreen||Element.prototype.webkitRequestFullscreen||Element.prototype.msRequestFullscreen);
const exitFullscreen = (document.exitFullscreen||document.mozCancelFullScreen||document.webkitCancelFullScreen||document.msExitFullscreen).bind(document);
const getFullscreenElement = ()=>document.fullscreenElement||document.mozFullscreenElement||document.webkitFullscreenElement||document.msFullscreenElement;

// ショートカット
const getFromId = document.getElementById.bind(document);
const createHTML = document.createElement.bind(document);
const createSVG = document.createElementNS.bind(document, "http://www.w3.org/2000/svg");

const dicesettings = getFromId("dicesettings");
const colorH = getFromId("colorH");
const colorS = getFromId("colorS");
const colorL = getFromId("colorL");

const othersettings = getFromId("othersettings");
const criticalSelect = getFromId("critical-select");
const fumbleSelect = getFromId("fumble-select");

const pagelink = getFromId("pagelink");
const DiceSound = getFromId("DiceSound");

const diceLog = getFromId("diceLog");

const SVG100x100Template = createSVG("svg");
SVG100x100Template.setAttribute("viewBox","0 0 100 100");

const diceWindowTemplate = createHTML("div");
{
	diceWindowTemplate.classList.add("dice");

	const diceT = createHTML("div");
	diceT.classList.add("diceT");

	const diceB = createHTML("div");
	diceB.classList.add("diceB");

	const diceR = createHTML("div");
	diceR.classList.add("diceR");
	diceR.textContent = "?";

	diceWindowTemplate.appendChild(diceT);
	diceWindowTemplate.appendChild(diceB);
	diceWindowTemplate.appendChild(diceR);
}

// localStorageに保存される設定
let bgcolorH = Number(localStorage.getItem("SimpleDice:bgcolorH")||340);
let bgcolorS = Number(localStorage.getItem("SimpleDice:bgcolorS")||18);
let bgcolorL = Number(localStorage.getItem("SimpleDice:bgcolorL")||80);
let criticalMin = Number(localStorage.getItem("SimpleDice:criticalMin")||5);
let fumbleMax = Number(localStorage.getItem("SimpleDice:fumbleMax")||96);

let circleData = ["シナモン文鳥","桜文鳥","白文鳥","ごま文鳥"];
const searchParams = new URL(location.href).searchParams;
if(searchParams.has("circleData")){
	// btoa(unescape(encodeURIComponent(JSON.stringify(circleData))))
	circleData = JSON.parse(decodeURIComponent(escape(atob(searchParams.get("circleData")))));
}else{
	const json = localStorage.getItem("SimpleDice:circleData");
	if(json){
		circleData = JSON.parse(json);
	}
}

const diceItemdata = [
	{type:"dice", range:"1 to 6 / 1 to 3 * 1", method:"add", name:"1d3"},
	{type:"dice", range:"1 to 4 / 1 to 4 * 1", method:"add", name:"1d4"},
	{type:"dice", range:"1 to 6 / 1 to 6 * 1", method:"add", name:"1d6"},
	{type:"dice", range:"0 to 20 / 1 to 8 * 1", method:"add", name:"1d8"},
	{type:"dice", range:"0 to 20 / 0 to 9 * 1", method:"dec", name:"1d10"},
	{type:"dice", range:"0 to 20 / 1 to 12 * 1", method:"add", name:"1d12"},
	{type:"dice", range:"0 to 20 / 0 to 4 * 1 + 0 to 20 / 0 to 9 * 1", method:"dec", name:"1d50"},
	{type:"dice", range:"0 to 20 / 0 to 9 * 2", method:"dec", name:"1d100"},
	{type:"dice", range:"1 to 6 / 1 to 3 * 2", method:"add", name:"2d3"},
	{type:"dice", range:"1 to 6 / 1 to 6 * 2", method:"add", name:"2d6"},
	{type:"dice", range:"1 to 6 / 1 to 3 * 3", method:"add", name:"3d3"},
	{type:"dice", range:"1 to 6 / 1 to 6 * 3", method:"add", name:"3d6"},
	{type:"dice", range:"1 to 6 / 1 to 6 * 5", method:"add", name:"5d6"},
	{type:"roulette", duration:8000, name:"ルーレット"},
	{type:"JavaSparrow", count:5, name:"JavaSparrow"}
];
const JavaSparrowSettings = [
	{h:"#844",b:"#c88",g:"#fff",f:false},
	{h:"#333",b:"#888",g:"#fff",f:false},
	{h:"none",b:"#fff",g:"none",f:false},
	{h:"#333",b:"#666",g:"#fff",f:true},
	{h:"none",b:"#ccc",g:"#fff",f:true}
];
const diceSVGList = {
"1 to 6":{
	dice:'<polygon points="5,5 95,5 95,95 5,95" stroke="#d8d8d8" stroke-width="3" stroke-linejoin="round" fill="#fff"/><g class="group"><text x="50" y="50" text-anchor="middle" dominant-baseline="central" stroke="#000" stroke-width="3" font-size="80" stroke-linejoin="round" font-family="monospace">?</text></g>',
	getelm:svgElement=> svgElement.querySelector(".group"),
	change:(elm,i)=>{
		if(i === 1) return elm.innerHTML = '<polygon points="50,27.5 35,74.5 72.5,44.5 27.5,44.5 65,74.5" fill="#0ff" transform="rotate(45)" transform-origin="center"/><circle cx="48" cy="52" r="6" fill="white"/>';
		if(i === 2) return elm.innerHTML = '<circle cx="35" cy="35" r="10" fill="blue"/><circle cx="70" cy="70" r="10" fill="blue"/>';
		if(i === 3) return elm.innerHTML = '<circle cx="25" cy="25" r="10" fill="green"/><circle cx="50" cy="50" r="10" fill="green"/><circle cx="75" cy="75" r="10" fill="green"/>';
		if(i === 4) return elm.innerHTML = '<circle cx="30" cy="30" r="10" fill="purple"/><circle cx="30" cy="70" r="10" fill="purple"/><circle cx="70" cy="30" r="10" fill="purple"/><circle cx="70" cy="70" r="10" fill="purple"/>';
		if(i === 5) return elm.innerHTML = '<circle cx="30" cy="30" r="10" fill="darkblue"/><circle cx="30" cy="70" r="10" fill="darkblue"/><circle cx="70" cy="30" r="10" fill="darkblue"/><circle cx="70" cy="70" r="10" fill="darkblue"/><circle cx="50" cy="50" r="10" fill="darkblue"/>';
		if(i === 6) return elm.innerHTML = '<circle cx="30" cy="25" r="10" fill="darkgreen"/><circle cx="70" cy="25" r="10" fill="darkgreen"/><circle cx="30" cy="50" r="10" fill="darkgreen"/><circle cx="70" cy="50" r="10" fill="darkgreen"/><circle cx="30" cy="75" r="10" fill="darkgreen"/><circle cx="70" cy="75" r="10" fill="darkgreen"/>';
	}
},
"0 to 20":{
	dice:'<polygon points="50,5 95,50, 50,95 5,50" stroke="#d8d8d8" stroke-width="3" stroke-linejoin="round" fill="#eee"/><polygon points="50,50 20,65 50,95" stroke="#d8d8d8" stroke-width="3" stroke-linejoin="round" fill="#eee"/><polygon points="50,50 80,65 50,95" stroke="#d8d8d8" stroke-width="3" stroke-linejoin="round" fill="#eee"/><polygon points="50,5 75,60 50,80 25,60" stroke="#d8d8d8" stroke-width="3" stroke-linejoin="round" fill="#fff"/><text class="text" x="50" y="50" text-anchor="middle" dominant-baseline="central" stroke="#000" stroke-width="3" font-size="30" stroke-linejoin="round" font-family="monospace">?</text>',
	getelm:svgElement=> svgElement.querySelector(".text"),
	change:(elm,i)=>{
		elm.textContent = i;
	}
},
"1 to 4":{
	dice:'<polygon points="50,5 95,90 5,90" stroke="#d8d8d8" stroke-width="3" stroke-linejoin="round" fill="#fff"/><text class="text" x="50" y="60" text-anchor="middle" dominant-baseline="central" stroke="#000" stroke-width="3" font-size="40" stroke-linejoin="round" font-family="monospace">?</text>',
	getelm:svgElement=> svgElement.querySelector(".text"),
	change:(elm,i)=>{
		elm.textContent = i;
	}
},
"j":{
	dice:'<filter xmlns="http://www.w3.org/2000/svg" id="f1" filterUnits="userSpaceOnUse"><feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="5" seed="3" stitchTiles="stitch" result="noise"/><feColorMatrix in="noise" type="saturate" values="0" result="mono"/><feComposite in="mono" in2="SourceGraphic" operator="in" result="res"/><feBlend in="res" in2="SourceGraphic" mode="lighten"/></filter>'+
	'<g stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 122C6-17 98-25 105 50c50 38 70 71 121 134-39-6-52-1-94 22-48 0-96-30-110-84Z"/><path d="M31 32C42 16 43 6 67 3c23 3 29 14 34 27 8 11-9 5-33 5s-47 7-37-3Z"/><path d="M27 49c0-13 5-12 41-14 37 0 37 1 37 15 7 10-13 18-35 20-34-1-51-10-43-21Z"/><path fill="#F88" d="M30 37 3 40l21 19 6-22"/></g><path d="M46 42a6 6 0 0 1 12 0 6 6 0 0 1-12 0Z"/>',
	getelm:svgElement=> svgElement.getElementsByTagName("path"),
	change:(elm,i)=>{
		elm[0].setAttribute("fill",JavaSparrowSettings[i].b);
		elm[0].setAttribute("filter" ,JavaSparrowSettings[i].f?"url(#f1)":"none" );
		elm[1].setAttribute("fill" ,JavaSparrowSettings[i].h );
		elm[1].setAttribute("stroke" ,JavaSparrowSettings[i].h==="none"?"none":"#000" );
		elm[1].setAttribute("filter" ,JavaSparrowSettings[i].f?"url(#f1)":"none" );
		elm[2].setAttribute("fill" ,JavaSparrowSettings[i].g );
		elm[2].setAttribute("stroke" ,JavaSparrowSettings[i].g==="none"?"none":"#000" );
	}
}
};
function init(){
	resetInputStyle();
	OthersettingsChange();
	const fragment = document.createDocumentFragment();
	for(let i=0;i<diceItemdata.length;i++){
		if(diceItemdata[i].type === "dice"){
			fragment.appendChild( createDice(diceItemdata[i]) );
		}else if(diceItemdata[i].type === "JavaSparrow"){
			fragment.appendChild( createJavaSparrow(diceItemdata[i]) );
		}else if(diceItemdata[i].type === "roulette"){
			fragment.appendChild( createRoulette(diceItemdata[i]) );
		}
	}
	document.body.insertBefore(fragment, pagelink);
	
	dicesettings.addEventListener("input",resetInputStyle,{passive:true});
	dicesettings.addEventListener("change",()=>{
		localStorage.setItem("SimpleDice:bgcolorH", bgcolorH);
		localStorage.setItem("SimpleDice:bgcolorS", bgcolorS);
		localStorage.setItem("SimpleDice:bgcolorL", bgcolorL);
	},{passive:true});
	getFromId("reqfullscreen").addEventListener("click",()=>{
		if(getFullscreenElement()){
			exitFullscreen();
		}else{
			requestFullscreen(document.documentElement);
		}
	},{passive:true});
	othersettings.addEventListener("change",OthersettingsChange,{passive:true});

	{
		const popupback = getFromId("popupback2");
		const popup = getFromId("popup2");
		getFromId("qrcodeImage").addEventListener("click",()=>{
			document.body.style.overflow = "hidden";
			popupback.style.display = "block";
			popup.style.display = "flex";
		},{passive:true});
		popupback.addEventListener("click",()=>{
			document.body.style.overflow = "auto";
			popupback.style.display = "none";
			popup.style.display = "none";
		},{passive:true});
	}
	if("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("./sw.js");
}
function createDice(data){
	const range = [];
	{
		const rangeTmp = data.range.split(" + ");
		for(let i=0;i<rangeTmp.length;i++){
			const [dirmin,,dirmax,,min,,max,,count] = rangeTmp[i].split(" ");
			for(let j=0;j<count;j++){
				range.push({dirmin:Number(dirmin),dirmax:Number(dirmax),min:Number(min),max:Number(max)});
			}
		}
	};
	const dice = diceWindowTemplate.cloneNode(true);
	const diceB = dice.querySelector(".diceB");
	const diceR = dice.querySelector(".diceR");
	dice.querySelector(".diceT").textContent = data.name;
	
	dice.classList.add("diceItem");

	const diceChildren = [];
	for(let i=0;i<range.length;i++){
		const dir = `${range[i].dirmin} to ${range[i].dirmax}`;
		const svgElement = SVG100x100Template.cloneNode(true);
		svgElement.innerHTML = diceSVGList[dir].dice;
		diceChildren.push(diceSVGList[dir].getelm(svgElement));
		diceB.appendChild(svgElement);
	};
	dice.addEventListener("click",()=>{
		DiceSound.currentTime=0;
		DiceSound.play();
		(function loop(n){
			if(n < 15){
				setTimeout(()=>{
					let sum = 0;
					for(let i=0;i<range.length;i++){
						const random = range[i].min+Math.floor((range[i].max-range[i].min+1)*Math.random());
						diceSVGList[`${range[i].dirmin} to ${range[i].dirmax}`].change(diceChildren[i], random);
						if(data.method==="add"){
							sum += random;
						}else if(data.method==="dec"){
							sum += random*Math.pow(10,range.length-(i+1));
						}
					};
					if(data.method==="dec" && sum === 0)sum = Math.pow(10, range.length-1)*(range[0].max+1);
					if(data.name==="1d100" && sum>=fumbleMax){
						diceR.style.color = "#f00";
						diceR.textContent = "ファンブル";
					}else if(data.name==="1d100" && sum<=criticalMin){
						diceR.textContent = "クリティカル";
						diceR.style.color = "#ff0";
					}else{
						diceR.textContent = sum;
						diceR.style.color = "#000";
					}
					loop(n+1);
				},100);
			}else{
				addDiceLog(data.name, diceR.textContent, diceR.style.color);
			}
		})(0);
	},{passive:true});
	return dice;
}
function createJavaSparrow(data){
	const JavaSparrow = diceWindowTemplate.cloneNode(true);
	const diceB = JavaSparrow.querySelector(".diceB");
	JavaSparrow.querySelector(".diceR").remove();
	JavaSparrow.querySelector(".diceT").textContent = data.name;
	
	const SVG230x210Template = createSVG("svg");
	SVG230x210Template.setAttribute("viewBox","0 0 230 210");
	SVG230x210Template.innerHTML = diceSVGList["j"].dice;
	const diceChildren = [];
	for(let i=0;i<data.count;i++){
		const svgElement = SVG230x210Template.cloneNode(true);
		diceChildren.push(diceSVGList["j"].getelm(svgElement));
		diceSVGList["j"].change(diceChildren[i], 2);
		diceB.appendChild(svgElement);
	}
	JavaSparrow.addEventListener("click",()=>{
		DiceSound.currentTime=0;
		DiceSound.play();
		(function loop(n){
			if(n < 15){
				setTimeout(()=>{
					for(let i=0;i<diceChildren.length;i++){
						diceSVGList["j"].change(diceChildren[i], Math.floor(JavaSparrowSettings.length*Math.random()));
					};
					loop(n+1);
				},100);
			}
		})(0);
	},{passive:true});
	return JavaSparrow;
}
function createRoulette(data){
	const audioplayer = createAudioPlayer("sample.wav");

	const diceRoulette = diceWindowTemplate.cloneNode(true);
	const diceB = diceRoulette.querySelector(".diceB");
	const diceR = diceRoulette.querySelector(".diceR");
	diceRoulette.querySelector(".diceT").textContent = data.name;

	const roulette = createSVG("svg");
	roulette.classList.add("roulette");
	roulette.setAttribute("viewBox","-100 -100 220 220");

	const rouletteGroup = createSVG("g");
	rouletteGroup.classList.add("rouletteGroup");

	const roulettePointer = createSVG("path");
	roulettePointer.classList.add("roulettePointer");
	roulettePointer.setAttribute("d","M110,-10 L90,0 L110,10 Z");
	roulettePointer.setAttribute("fill","red");
	roulettePointer.setAttribute("stroke","white");

	roulette.appendChild(rouletteGroup);
	roulette.appendChild(roulettePointer);

	diceB.appendChild(roulette);

	const rouletteEdit = createHTML("button");
	rouletteEdit.classList.add("rouletteEdit");
	rouletteEdit.textContent = "編集";

	diceRoulette.appendChild(rouletteEdit);

	const rouletteCubicBezier = [0.24, -0.1, 0.05, 1];
	const movement = cubicBezier(...rouletteCubicBezier);

	let rouletteTurnFlg = false;

	let textMargin = 30;
	let textSize = 10;
	let rouletteAngle = 0;
	
	function resetRoulette(){
		rouletteGroup.style = `transform:rotate(${rouletteAngle}deg);transition-duration:${data.duration}ms;transition-timing-function:cubic-bezier(${rouletteCubicBezier.join(",")});`;
		
		while(rouletteGroup.lastChild) rouletteGroup.removeChild(rouletteGroup.lastChild);
		const rotate = (circleData.length!==1) ? (-360/circleData.length) : 360;
		const pathTheta = 3.14/180*rotate;
		const rouletteGroupTemplate = createSVG("g");
		{
		const pathArc = `M0,0 L100,0 A100,100 0 0,0 ${Math.cos(pathTheta)*100},${Math.sin(pathTheta)*100}z`;

		const path = createSVG("path");
		path.setAttribute("d",pathArc);
		
		const text = createSVG("text");
		text.setAttribute("font-size", textSize);
		text.setAttribute("dx", textMargin);
		text.style.transform = `rotate(${rotate/2}deg)`;
		rouletteGroupTemplate.appendChild(path);
		rouletteGroupTemplate.appendChild(text);
		}

		const fragment = document.createDocumentFragment();
		for(let i=0;i<circleData.length;i++){
			const group = rouletteGroupTemplate.cloneNode(true);
			group.style.transform = `rotate(${rotate*i}deg)`;

			const path = group.querySelector("path");
			path.setAttribute("fill",`hsl(${(i%7)*36},100%,50%)`);

			const text = group.querySelector("text");
			text.textContent = circleData[i];
			fragment.appendChild(group);
		}
		rouletteGroup.appendChild(fragment);
	}
	function resultOfRoulette(start, end, time){
		const val = (movement(time) * (end - start) + start + 360) % 360;
		return circleData[Math.floor( val / 360 * circleData.length)];
	}
	async function turnRoulette(){
		if(rouletteTurnFlg) return;
		diceR.innerText = "?";
		const startTime = new Date();
		const startAngle = rouletteAngle;
		rouletteAngle += Math.random()*1000+10000;
		rouletteGroup.style.transform = `rotate(${rouletteAngle}deg)`;
		rouletteTurnFlg = true;
		let nowText = resultOfRoulette(startAngle, rouletteAngle, 0);
		let oldText;
		while(rouletteTurnFlg){
			oldText = nowText;
			nowText = resultOfRoulette(startAngle, rouletteAngle, (new Date() - startTime) / data.duration);
			if(oldText !== nowText) audioplayer.play();
			await (new Promise(e=>setTimeout(e,50)));
		}
	}
	// https://web.analogstd.com/tips/posts/js/cubic-bezier.php
	// Cubic-Bezierの値を計算する関数を生成する関数	
	function cubicBezier($x1, $y1, $x2, $y2){
		// Refer: http://www.moshplant.com/direct-or/bezier/math.html
		var cx = 3 * $x1,
			bx = 3 * ($x2 - $x1) - cx,
			ax = 1 - cx - bx;
		var cy = 3 * $y1,
			by = 3 * ($y2 - $y1) - cy,
			ay = 1 - cy - by;
		// 媒介変数表示したX座標
		var bezierX = function ($t) {
			return $t * (cx + $t * (bx + $t * ax));
		};
		// X座標のt微分
		var bezierDX = function($t){
			return cx + $t * (2 * bx + 3 * ax * $t);
		};
		// ニュートン法で数値解析する
		var newtonRaphson = function($x){
			if($x <= 0){
				return 0;
			}
			if($x >= 1){
				return 1;
			}
			var prev, t = $x;
			do{
				prev = t;
				t = t - ((bezierX(t) - $x) / bezierDX(t));
			} while(Math.abs(t - prev) > 1e-4);   // 1e-2 程度でも良い
			return t;
		};
		return function($t){
			// X座標(時刻)に対応する媒介変数tの値を取得する
			var t = newtonRaphson($t);
			// Y座標(Easing量)を計算する
			return t * (cy + t * (by + t * ay));
		};
	};
	// クリックイベント
	rouletteGroup.addEventListener("click",turnRoulette,{passive:true});

	// アニメーション終了イベント
	rouletteGroup.addEventListener("transitionend",()=>{
		if(rouletteTurnFlg){
			rouletteTurnFlg = false;
			diceR.textContent = resultOfRoulette(rouletteAngle, rouletteAngle, 1);
			addDiceLog(data.name, diceR.textContent);
		}
	},{passive:true});
	resetRoulette();
	{
		const popupback = getFromId("popupback1");
		const popup = getFromId("popup1");
		const maindiv = getFromId("popupdiv1");
		
		const addInput = getFromId("popupadddiv1");
		addInput.addEventListener("click",()=>addInputDiv("").focus());
		
		const closeInput = getFromId("popupclosediv1");
		closeInput.addEventListener("click",closeFunc,{passive:true});
		popupback.addEventListener("click",closeFunc,{passive:true});
		
		function closeFunc(){
			document.body.style.overflow = "auto";
			popupback.style.display = "none";
			popup.style.display = "none";
			circleData = [...maindiv.querySelectorAll("input[type=text]")].map(e=>e.value);
			maindiv.replaceChildren();
			localStorage.setItem("SimpleDice:circleData",JSON.stringify(circleData));
			resetRoulette();
		}
		maindiv.addEventListener("click",e=>{
			if(e.target.tagName.toLowerCase() == "input" && e.target.type.toLowerCase() == "button"){
				e.target.parentElement.remove();
			}
		})
		rouletteEdit.addEventListener("click",()=>{
			document.body.style.overflow = "hidden";
			popupback.style.display = "block";
			popup.style.display = "flex";
			for(let i=0;i<circleData.length;i++){
				addInputDiv(circleData[i]);
			}
		},{passive:true});
		function addInputDiv(value){
			const inputdiv = createHTML("div");
			inputdiv.style.display = "flex";
		
			const addText = createHTML("input");
			addText.type = "text";
			addText.value = value;
			addText.style = "width:100%;height:30px;";

			const deleteText = createHTML("input");
			deleteText.type = "button";
			deleteText.value = "削除";
			inputdiv.appendChild(addText);
			inputdiv.appendChild(deleteText);
			maindiv.insertBefore(inputdiv, maindiv.firstChild);
			return addText;
		}
	}
	return diceRoulette;
}
function createAudioPlayer(src){
	return {
		audioBuffer:null,
		audioContext:null,
		audioSource:null,
		play:function(){
			if(this.audioContext === null){
				this.audioContext = new AudioContext();
				const request = new XMLHttpRequest();
				request.open("GET", src);
				request.responseType = "arraybuffer";
				request.onload = ()=>{
					this.audioContext.decodeAudioData(request.response,buffer=>{
						this.audioBuffer = buffer;
					});
				}
				request.send();
			}
			this.audioSource = this.audioContext.createBufferSource();
			this.audioSource.buffer = this.audioBuffer;
			this.audioSource.connect(this.audioContext.destination);
			this.audioSource.start(0);
		}
	};
}
function addDiceLog(diceName, text, textColor="#000"){
	const localTimeString = new Date().toLocaleTimeString();
	diceLog.insertAdjacentHTML("afterbegin",`<p>${localTimeString} ${diceName} =&gt; <span style="color:${textColor}">${text}</span></p>`);
}
function resetInputStyle(e){
	if(e){
		if(e.target.id==="colorH"){
			bgcolorH = colorH.valueAsNumber;
		}else if(e.target.id==="colorS"){
			bgcolorS = colorS.valueAsNumber;
		}else if(e.target.id==="colorL"){
			bgcolorL = colorL.valueAsNumber;
		}
	}else{
		colorH.value = bgcolorH;
		colorS.value = bgcolorS;
		colorL.value = bgcolorL;
	}
	document.documentElement.style.setProperty("--bgcolor",`hsl(${bgcolorH},${bgcolorS}%,${bgcolorL}%)`);
	
	
	let gradientVal = "linear-gradient(to right";
	for(let i=0;i<10;i++) gradientVal += `,hsl(${bgcolorH},${i*10}%,${bgcolorL}%)`;
	colorS.style.background = gradientVal+")";

	gradientVal = "linear-gradient(to right";
	for(let i=0;i<10;i++) gradientVal += `,hsl(${bgcolorH},${bgcolorS}%,${i*10}%)`;
	colorL.style.background = gradientVal+")";
	
	document.body.style.color = bgcolorL>35?"#000":"#fff";
}
function OthersettingsChange(e){
	if(e){
		if(e.target.id==="critical-select"){
			criticalMin = Number(criticalSelect.value);
		}else if(e.target.id==="fumble-select"){
			fumbleMax = Number(fumbleSelect.value);
		}
	}else{
		criticalSelect.value = criticalMin;
		fumbleSelect.value = fumbleMax;
	}
}
init();
})();