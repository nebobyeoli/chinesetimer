/*** Initialize everything & first-load globals here ***/

// Note!
// function (funcName)() {} is used on normal functions
// (funcName) () => {} is used on class or array functions that changes the inner var of the set

const html = document.documentElement;
const body = document.body;

function $(id)          { return document.getElementById(id); }
function $s(selector)   { return document.querySelector(selector); }
function $c(className)  { return document.getElementsByClassName(className)[0]; }

function getBodyFontSize()  { return getComputedStyle(body).fontSize.slice(0, -2); }

function getTimeSeconds()   { return Math.floor(performance.now() / 1000); }
function setRootStyle(property, value, priority) {        html.style.setProperty(property, value, priority); }
function getRootStyle(property)                  { return html.style.getPropertyValue(property);             }

function HexToDecimals(hexStr) { // for hex colors
    return parseInt(hexStr.substr(1,2), 16) + ', ' + parseInt(hexStr.substr(3,2), 16) + ', ' + parseInt(hexStr.substr(5,2), 16);
}

function ColorToHex(rgbStr) {
    let rgbArr = rgbStr.split(/[rgb, \(\)]+/).slice(1, 4).map(x => +x);
    let hexStr = '#';
    rgbArr.forEach(rgb => { hexStr += rgb > 9 ? rgb.toString(16) : '0' + rgb.toString(16); });
    return hexStr;
}

const $title = $('title');

const $timer_digits = $('timer-digits');
const $timer_chinese_chars = $('timer-chinese-chars');
const $timer_chinese_pinyin = $('timer-chinese-pinyin');

var baseColor = '180, 0, 60'; // 'R, G, B'
var wrapperAlpha = 0.2;

var btnSetTimeAlpha = 0.25;
var btnAlpha = 0.5;

const txtBrightness = 0.4;
const txtEditBrightness = 1.1;
const txtEditHuerad = 1;

const fontSizeBase = '6vmax';
var fontSizeMax /* draw.js */;
const fontFamily = '배달의민족 연성';
var digitsFont;
var editTime;

const case_font_ratio = 1.5;
const case_size_max = '9vw';

const case_border_style = 'solid';
const border_style = 'solid';

const border_alpha = 1;

var border_thickness = '6px';

function getEditedTime() {
    let t = TN.getIds().map(id => id.innerText);
    let edited = t[0]*6000 + t[1]*600 + t[2]*60 + t[3]*100 + t[4]*10 + t[5]*1;
    return edited;
}

function setNewColor(RGBnum, firstinit) {
    baseColor = RGBnum;

    // for unchanging rootvars
    setRootStyle('--base-color',        `rgb(${baseColor})`);
    setRootStyle('--wrapper-alpha',     `rgba(${baseColor}, ${wrapperAlpha})`);
    
    if (firstinit) {
        // for first init
        setRootStyle('--btn-setTime-alpha', `rgba(${baseColor}, 1`);
        setRootStyle('--btn-alpha',         `rgba(${baseColor}, 1)`);
        setRootStyle('--border-alpha',      `rgba(${baseColor}, ${border_alpha})`);
    }

    else {
        // for $btn_setTimeout
        if (TIMER.editing) {
            setRootStyle('--btn-setTime-alpha', `rgba(${baseColor}, ${btnSetTimeAlpha}`);
        }
        else {
            if (btnBorder.getState() == 1) setRootStyle('--btn-setTime-alpha', `rgba(${baseColor}, 1`);
            else setRootStyle('--btn-setTime-alpha', `rgba(${baseColor}, ${btnAlpha}`);
        }

        // for $btn_border
        setRootStyle('--border-alpha', `rgba(${baseColor}, ${btnBorder.getState()})`);
        if (btnBorder.getState() == 1) {
            setRootStyle('--btn-alpha', `rgba(${baseColor}, 1)`);
            if (btnSetTimeout.getState() == false) setRootStyle('--btn-setTime-alpha', `rgba(${baseColor}, 1`);
        }
        else {
            setRootStyle('--btn-alpha', `rgba(${baseColor}, ${btnAlpha})`);
            if (btnSetTimeout.getState() == false) setRootStyle('--btn-setTime-alpha', `rgba(${baseColor}, ${btnAlpha}`);
        }
    }
}

function txtDarkSpan(innerHTML) {
    let brightFilter;

    if (innerHTML != '분' && innerHTML != '초' && TIMER.getBaseHTML().includes('editTime'))
        brightFilter = `hue-rotate(${txtEditHuerad}rad) brightness(${txtEditBrightness})`;
    else brightFilter = `brightness(${txtBrightness})`;
    
    if (innerHTML == ' ' && innerHTML != '0') innerHTML = '&#8202;'; // hair space
    return `<span style="filter: ${brightFilter};">${innerHTML}</span>`;
}

function centerBody(distTop, distBottom) {
    let propDist = distTop + distBottom;
    let marginHeight = html.clientHeight - body.clientHeight;
    // body margin 비례배분
    setRootStyle('--body-margin', `${marginHeight*(distTop/propDist)}px ${border_thickness} ${marginHeight*(distBottom/propDist)}px ${border_thickness}`);
}

const TIMER = {

    class: `class="outer case ${editTime}"`,
    style: `style="width: var(--case-size); border-right: none; ${digitsFont}"`,

    editing: false, // user is editing timer time
    drawPaused: false, // requestAnimationFrame of timerUpdate is paused
    // origTime: 0, // time set before user made changes to it
    
    isActive: false, // timer is activated
    timeout: 5 * 60 + 0, // as seconds

    initialTime: 0, stoppedTime: 0, interval: 0,
    now: 0,
    remains: 0,

    getBaseHTML: () => {
        TIMER.class = `class="outer case ${editTime}"`;
        TIMER.style = `style="width: var(--case-size); border-right: none; ${digitsFont}"`;
        return TIMER.class + TIMER.style;
    },

    reset: () => {
        TIMER.initialTime = TIMER.stoppedTime = TIMER.interval = 0;
        TIMER.now = TIMER.remains = 0;
    }
}

// Init once
setRootStyle('--font-family',        fontFamily);
setRootStyle('--font-size',         `min(${fontSizeBase}, ${fontSizeMax})`);
$title.innerHTML = txtDarkSpan($title.innerHTML);

setRootStyle('--case-size-fixed',   `${getBodyFontSize() * case_font_ratio}px`);
setRootStyle('--case-size',         `min(${getBodyFontSize() * case_font_ratio}px, ${case_size_max})`);
setRootStyle('--case-border-style',  case_border_style);
setRootStyle('--border-style',       border_style);

setNewColor(baseColor, true);
setRootStyle('--border-thickness',   border_thickness);
