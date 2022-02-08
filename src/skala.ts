
( () => { // Iife so that the uglifier knows that all variables and functions are local (i.e. not exported) and thus may be shortened

const divRoot = document.getElementById( "skalaAblesen" ) as HTMLDivElement;
const svgRoot = divRoot.querySelector( "svg" ) as SVGSVGElement;
const svgMouseOver = svgRoot.querySelector( "#mouseover" ) as SVGGElement;
const svgZeiger2 = svgRoot.querySelector( "#zeiger2" ) as SVGGElement;
const svgZeiger1 = svgZeiger2.querySelector( "#zeiger1" ) as SVGGElement;
const svgZeiger0 = svgZeiger1.querySelector( "#zeiger0" ) as SVGGElement;

const cursor = svgRoot.querySelector( "#cursor" ) as SVGElement;

const divZahlZuText = divRoot.querySelector( "#zahlZuText" ) as HTMLDivElement;

const spanCenti2 = divZahlZuText.querySelector( "#centi2" ) as HTMLSpanElement;
const spanCenti1 = divZahlZuText.querySelector( "#centi1" ) as HTMLSpanElement;
const spanCentiK = divZahlZuText.querySelector( "#centiK" ) as HTMLSpanElement;
const spanCenti0 = divZahlZuText.querySelector( "#centi0" ) as HTMLSpanElement;
const spanMilli2 = divZahlZuText.querySelector( "#milli2" ) as HTMLSpanElement;
const spanMilli1 = divZahlZuText.querySelector( "#milli1" ) as HTMLSpanElement;
const spanMilli0 = divZahlZuText.querySelector( "#milli0" ) as HTMLSpanElement;

const buttonContainer = document.getElementById( "buttonContainer" ) as HTMLDivElement;
const btnLeft   = buttonContainer.querySelector( "#btnLeft"   ) as HTMLDivElement;
const btnRight  = buttonContainer.querySelector( "#btnRight"  ) as HTMLDivElement;
const btnPlay   = buttonContainer.querySelector( "#btnPlay"   ) as HTMLDivElement;

type ZifferTripel = {
	zahl: number;
	ziffer2: number;
	ziffer1: number;
	ziffer0: number;
}

const ZAHL_MAX = 220;
let letzteZahl = 210;

let animationAktiv = false; // While an animation is playing, prevent Dom access.
let animationReset = true; // An animation might hide dom elements. This has to be reset. As manipulating Dom elements is slow and onmousemove() happens often, this variable prevents unnecessary Dom access.
let animationTStart: null|number = null;
let animationTPrev: null|number = null; // previous timestamp to skip unnecessary calculations
const animationTDeltaEnd = 500; // duration of animation in ms
let animationYZiel: ZifferTripel;
let animationZiffer: null|number = null;

svgMouseOver.onmousemove = ( event ) => {
	if( animationAktiv === true ) {
		return;
	}
	const xPos = getCursorXScaleFromEvent( event );
	letzteZahl = xPos;
	skalaZeigeVorschau( xPos );
};

svgMouseOver.onclick = ( event ) => {
	const xPos = getCursorXScaleFromEvent( event );
	skalaSpieleAnimation( xPos );
};

btnLeft.onclick = ( _event ) => {
	if( animationAktiv === true ) {
		return;
	}
	if( letzteZahl > 0 ) {
		letzteZahl--;
		skalaZeigeVorschau( letzteZahl );
	}
};
btnRight.onclick = ( _event ) => {
	if( animationAktiv === true ) {
		return;
	}
	if( letzteZahl < ZAHL_MAX ) {
		letzteZahl++;
		skalaZeigeVorschau( letzteZahl );
	}
};
btnPlay.onclick = ( _event ) => {
	skalaSpieleAnimation( letzteZahl );
};

function skalaZeigeVorschau( zahl: number ): void {
	if( zahl < 0 || zahl > ZAHL_MAX ) {
		return;
	}
	if( animationAktiv === true ) {
		return;
	}
	if( animationReset === false ) {
		spanCenti2.classList.remove( "hiddenDisplay" );
		spanCenti1.classList.remove( "hiddenDisplay" );
		spanCentiK.classList.remove( "hiddenDisplay" );
		spanCenti0.classList.remove( "hiddenDisplay" );
		spanMilli2.classList.remove( "hiddenDisplay" );
		spanMilli1.classList.remove( "hiddenDisplay" );
		spanMilli0.classList.remove( "hiddenDisplay" );
	}
	cursor.setAttribute( "transform", "translate(" + zahl + ",0)" );
	const ziffern = zahlZuZifferTripel( zahl );
	aktualisiereTextAnzeige( ziffern );
}

function skalaSpieleAnimation( zahl: number ): void {
	if( zahl < 0 || zahl > ZAHL_MAX ) {
		return;
	}
	if( animationAktiv === true ) {
		return;
	}
	animationAktiv = true;
	animationReset = false;

	animationYZiel = zahlZuZifferTripel( zahl );
	animationTStart = null;

	window.requestAnimationFrame( aktualisiereZeiger );
}

/**
 * Liest die x-Potision der Maus und skaliert sie passend zum Gliedermaßstab.
 * @param event The mouse event.
 * @return Die Zahl, die auf dem Gliedermaßstab abgelesen würde. Mindestens 0.
 */
function getCursorXScaleFromEvent( event: MouseEvent ): number {
	try {
		let cursorX = event.offsetX; // x-Position des Mauszeigers
		const ctm = svgRoot.getScreenCTM() as DOMMatrix; // Transformations-matrix wie das svg angezeigt wird.
		cursorX = cursorX / ctm.a; // invert scaling of svg (-ctm.e not needed as this is already the offset)
		cursorX = cursorX - 10; // margin der Skala abziehen (durch g id="offset")
		cursorX = Math.round( cursorX ); // Auflösung ist Ein Millimeter wegen der Sprache.

		if( cursorX < 0 ) {
			cursorX = 0;
		}
		return cursorX;
	} catch( error ) {
		return 0;
	}
}

function zahlZuZifferTripel( zahl: number ): ZifferTripel {
	let rest = zahl;
	const ziffer2 = Math.floor( rest / 100 );
	rest -= ziffer2 * 100;
	const ziffer1 = Math.floor( rest / 10 );
	rest -= ziffer1 * 10;
	const ziffer0 = Math.round( rest );
	return { zahl, ziffer2, ziffer1, ziffer0 } as ZifferTripel;
}

function aktualisiereTextAnzeige( ziffern: ZifferTripel ) {
	const zahl = ziffern.zahl;
	const ziffer2 = ziffern.ziffer2;
	const ziffer1 = ziffern.ziffer1;
	const ziffer0 = ziffern.ziffer0;

	if( ziffer2 == 0 ) {
		spanCenti2.innerHTML = "";
		spanMilli2.innerHTML = "";
	} else {
		spanCenti2.innerHTML = zifferZuString( ziffer2, false, 1 );
		spanMilli2.innerHTML = zifferZuString( ziffer2, false, 2 );
	}

	if( ziffer1 == 0 ) {
		spanCenti1.innerHTML = "";
		if( ziffer2 == 0 ) {
			spanCenti1.innerHTML = "Null";
		}
		spanMilli1.innerHTML = "";
	} else {
		spanCenti1.innerHTML = zifferZuString( ziffer1, ( ziffer2 > 0 ), 0 );
		spanMilli1.innerHTML = zifferZuString( ziffer1, ( ziffer2 > 0 ), 1 );
	}

	if( ziffer0 == 0 ) {
		spanCenti0.innerHTML = "Null";
		spanMilli0.innerHTML = "";
		if( zahl == 0 ) {
			spanMilli0.innerHTML = "Null";
		}
	} else {
		spanCenti0.innerHTML = zifferZuString( ziffer0, false, 0 );
		spanMilli0.innerHTML = zifferZuString( ziffer0, ( zahl > 10 ), 0 );
	}

	// Sonderfälle überschreiben
	if( ziffer2 == 1 && ziffer1 == 1 ) {
		spanCenti2.innerHTML = "";
		spanCenti1.innerHTML = "Elf";
	} else if( ziffer2 == 1 && ziffer1 == 2 ) {
		spanCenti2.innerHTML = "";
		spanCenti1.innerHTML = "Zwölf";
	}
	if( ziffer1 == 1 && ziffer0 == 1 ) {
		spanMilli1.innerHTML = "";
		let tmp0 = "Elf";
		if( ziffer2 > 0 )
			tmp0 = tmp0.toLowerCase();
		spanMilli0.innerHTML = tmp0;
	} else if( ziffer1 == 1 && ziffer0 == 2 ) {
		spanMilli1.innerHTML = "";
		let tmp0 = "Zwölf";
		if( ziffer2 > 0 )
			tmp0 = tmp0.toLowerCase();
		spanMilli0.innerHTML = tmp0;
	}
}

function zifferZuString( ziffer: number, lowerCase = false, potenz = 0 ): string {
	ziffer = Math.round( ziffer );
	if( isNaN( ziffer ) || ziffer > 9 || ziffer < 0 )
		throw new Error( "Agrument ist keine Ziffer" );
	let ans;
	switch( ziffer ) {
		case 0: ans = "Null"; break;
		case 1: ans = "Eins"; break;
		case 2: ans = "Zwei"; break;
		case 3: ans = "Drei"; break;
		case 4: ans = "Vier"; break;
		case 5: ans = "Fünf"; break;
		case 6: ans = "Sechs"; break;
		case 7: ans = "Sieben"; break;
		case 8: ans = "Acht"; break;
		default:
		case 9: ans = "Neun"; break;
	}
	if( potenz === 1 ) {
		switch( ziffer ) {
			case 1: ans = "Zehn"; break;
			case 2: ans = "Zwanzig"; break;
			case 3: ans = "Dreißig"; break;
			case 6: ans = "Sechzig"; break;
			case 7: ans = "Siebzig"; break;
			// jup, es ist Achtzig und nicht Achzig (und auch nicht Achzich)
			default: {
				ans += "zig";
			}
		}
	} else if( potenz > 1 ) {
		if( ziffer === 1 ) {
			ans = "Ein";
		}
		switch( potenz ) {
			case 2: ans += "hundert"; break;
			case 3: ans += "tausend"; break;
			default: throw new Error( "Potenzen > 3 nicht unterstützt." );
		}
	}
	if( lowerCase === true ) {
		ans = ans.toLowerCase();
	}
	return ans;
}

function aktualisiereZeiger( tNow: number ) {
	if( animationTStart === null ) {
		// init and re-start animation
		if( animationYZiel.zahl === 0 ) {
			animationAktiv = false;
			return; // do nothing
		}
		animationTStart = tNow;
		animationTPrev = tNow;
		if( animationZiffer === null ) {
			// init complete animation
			svgZeiger2.classList.remove( "hiddenDisplay" );
			spanCenti2.classList.add( "hiddenDisplay" );
			spanCenti1.classList.add( "hiddenDisplay" );
			spanCentiK.classList.add( "hiddenDisplay" );
			spanCenti0.classList.add( "hiddenDisplay" );
			spanMilli2.classList.add( "hiddenDisplay" );
			spanMilli1.classList.add( "hiddenDisplay" );
			spanMilli0.classList.add( "hiddenDisplay" );
			// reset animation
			svgZeiger2.setAttribute( "transform", "translate(0,0)" );
			svgZeiger1.setAttribute( "transform", "translate(0,0)" );
			svgZeiger0.setAttribute( "transform", "translate(0,0)" );
			if( animationYZiel.ziffer2 !== 0 ) {
				animationZiffer = 2;
			} else {
				// skip first digit
				if( animationYZiel.ziffer1 !== 0 ) {
					animationZiffer = 1;
				} else {
					// also skip second digit
					spanCenti1.classList.remove( "hiddenDisplay" ); // display "Null" before "Komma"
					// ( animationYZiel.zahl === 0 ) already caught above
					animationZiffer = 0;
				}
			}
		} else {
			// won't happen, already prepared, see animationZiffer--; below
		}
		window.requestAnimationFrame( aktualisiereZeiger );
		return;
	}

	const tDelta = tNow - animationTStart;
	if( animationTPrev === tNow ) {
		return; // skip unnecessary calculations
	}

	if( tDelta < animationTDeltaEnd ) {
		// Animation running
		switch( animationZiffer ) {
			case 2: {
				const x2 = tDelta / animationTDeltaEnd * animationYZiel.ziffer2;
				svgZeiger2.setAttribute( "transform", "translate(" + x2 * 100 + ",0)" );
				break;
			}
			case 1: {
				const x1 = tDelta / animationTDeltaEnd * animationYZiel.ziffer1;
				svgZeiger1.setAttribute( "transform", "translate(" + x1 *  10 + ",0)" );
				break;
			}
			case 0: {
				const x0 = tDelta / animationTDeltaEnd * animationYZiel.ziffer0;
				svgZeiger0.setAttribute( "transform", "translate(" + x0       + ",0)" );
				break;
			}
		}

		animationTPrev = tNow;
	} else {
		// Animation for a digit is complete
		// @ts-expect-error - (animationZiffer != null), wegen (animationTStart !== null)
		if( animationZiffer > 0 ) {
			// prepare animating the next digit
			animationTStart = tNow;
			animationTPrev = tNow;
			if( animationZiffer == 2 ) {
				const x2 = animationYZiel.ziffer2;
				svgZeiger2.setAttribute( "transform", "translate(" + x2 * 100 + ",0)" );
				spanCenti2.classList.remove( "hiddenDisplay" );
				spanMilli2.classList.remove( "hiddenDisplay" );
			} else {
				const x1 = animationYZiel.ziffer1;
				svgZeiger1.setAttribute( "transform", "translate(" + x1 *  10 + ",0)" );
				spanCenti1.classList.remove( "hiddenDisplay" );
				spanMilli1.classList.remove( "hiddenDisplay" );
			}
			// @ts-expect-error - (animationZiffer != null), wegen (animationTStart !== null)
			animationZiffer--;

		} else {
			// All three animations complete
			animationTStart = null;
			animationTPrev = null;
			animationZiffer = null;
			animationAktiv = false;

			const x0 = animationYZiel.ziffer0;
			svgZeiger0.setAttribute( "transform", "translate(" + x0 + ",0)" );
			spanCenti0.classList.remove( "hiddenDisplay" );
			spanCentiK.classList.remove( "hiddenDisplay" );
			spanMilli0.classList.remove( "hiddenDisplay" );
		}
	}

	if( animationTStart !== null ) {
		window.requestAnimationFrame( aktualisiereZeiger );
	}
}

} )(); // end of Iife
