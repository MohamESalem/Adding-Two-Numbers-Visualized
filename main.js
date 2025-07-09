'use strict';

const dom = {
    num1Input: document.getElementById('num1-input'),
    num2Input: document.getElementById('num2-input'),
    setupBtn: document.getElementById('setup-btn'),
    nextBtn: document.getElementById('next-btn'),
    resetBtn: document.getElementById('reset-btn'),
    autoplayBtn: document.getElementById('autoplay-btn'),
    stepCounter: document.getElementById('step-counter'),
    carryDisplay: document.getElementById('carry-display'),
    stateInfo: document.getElementById('state-info'),
    list1Container: document.getElementById('list1-container'),
    list2Container: document.getElementById('list2-container'),
    resultContainer: document.getElementById('result-container'),
};

let state= {};

function resetState() {
    if(state.autoPlayInterval) {
        clearInterval(state.autoPlayInterval); 
    }

    state= {
        l1: null,
        l2: null,
        result: null,
        dummyHead: new ListNode(0),
        currentL1: null,
        currentL2: null,
        currentResult: null,
        carry: 0,
        step: 0,
        isComplete: false,
        autoPlayInterval:null,
        lastSum: {val1: 0, val2: 0, carry: 0, total: 0},
    };

    state.currentResult = state.dummyHead;
}

class ListNode {
    constructor(val) {
        this.val = val;
        this.next = null;
    }
}

function numberToLinkedList(num) {
    if (num===0) return new ListNode(0);
    let head = null;
    let current = null;
    while (num>0) {
        const digit = num % 10;
        const newNode = new ListNode(digit);
        if(!head) {
            head = current = newNode; 
        } else {
            current.next = newNode;
            current = newNode; 
        }

        num = Math.floor(num/10);
    }

    return head;
}

function renderLinkedList(container, head, currentNode, nodeClass) {
    container.innerHTML = '';
    if (!head) {
        const nullNode = document.createElement('div'); 
        nullNode.className = 'null-node';
        nullNode.textContent = 'NULL';
        container.appendChild(nullNode);
        return;
    }

    let node = head;
    while (node) {
        const nodeDiv = document.createElement('div');
        nodeDiv.className = `node ${nodeClass}`;

        if (node === currentNode) {
            nodeDiv.classList.add('current');
        }

        nodeDiv.textContent = node.val;
        container.appendChild(nodeDiv);

        if (node.next) {
            const arrow = document.createElement('span');
            arrow.className= ' arrow';
            arrow.textContent = '→';
            container.appendChild(arrow);
        }

        node = node.next;
    }
}

function updateDisplay() {
    renderLinkedList(dom.list1Container, state.l1, state.currentL1, 'l1');
    renderLinkedList(dom.list2Container, state.l2, state.currentL2, 'l2');
    renderLinkedList(dom.resultContainer, state.result, null, 'result');
    dom.stepCounter.textContent = `Step ${state.step}: ${state.isComplete? 'Complete' : 'Processing'}`;
    dom.carryDisplay.textContent = `Carry: ${state.carry}`;
    updateStateInfo();
}

function updateStateInfo() {
    if (state.isComplete) {
        dom.stateInfo.innerHTML = `<h3>✅ Algorithm Complete!</h3><p>The addition is finished. The result list represents the sum in reverse order.</p>`;
        return;
    }

    if (state.step===0) {
        dom.stateInfo.innerHTML = `<h3>Initialization</h3><p>Enter numbers and click "Setup". The algorithm is ready to begin.</p>`;
        return;
    }

    const {val1, val2, carry, total} = state.lastSum;
    const digit = total % 10; 
    dom.stateInfo.innerHTML = `
    <h3>Step ${state.step} Processing</h3>
    <div class="math-display">
        (${val1}) + (${val2}) +(carry: ${carry}) = <strong>${total}</strong>
    </div>
    <p>A new node with value <strong>${digit}</strong> is created and added to the result list.</p>
    <p>The new carry is <strong>${Math.floor(total / 10)}</strong>.</p>
    `;
}

function setupVisualization() {
    resetState();
    const num1 = parseInt(dom.num1Input.value, 10) || 0;
    const num2 = parseInt(dom.num2Input.value, 10) || 0;
    state.l1 = numberToLinkedList(num1);
    state.l2 = numberToLinkedList(num2);
    state.currentL1 = state.l1;
    state.currentL2 = state.l2;
    updateDisplay();
}

function nextStep() {
    if (state.isComplete) return;
    if (!state.currentL1 && !state.currentL2 && state.carry===0) {
        state.isComplete = true;
        updateDisplay();
        return;
    }

    state.step++;
    const val1 = state.currentL1 ? state.currentL1.val : 0;
    const val2 = state.currentL2 ? state.currentL2.val : 0;
    const sum = val1 + val2 + state.carry;
    state.lastSum = {val1, val2, carry: state.carry, total: sum};

    const digit = sum % 10;
    state.carry = Math.floor(sum/10);

    const newNode = new ListNode(digit);
    state.currentResult.next = newNode;
    state.currentResult = newNode;
    state.result = state.dummyHead.next;
    if (state.currentL1) state.currentL1 = state.currentL1.next;
    if (state.currentL2) state.currentL2 = state.currentL2.next;

    updateDisplay();
}


function reset() {
    dom.num1Input.value = '342';
    dom.num2Input.value = '465';
    setupVisualization();
}

function autoPlay() {
    if (state.autoPlayInterval) {
        clearInterval(state.autoPlayInterval);
        state.autoPlayInterval = null;
        dom.autoplayBtn.textContent = 'Auto Play';
        return;
    }

    dom.autoplayBtn.textContent = 'Pause';
    state.autoPlayInterval = setInterval(()=> {
        if (state.isComplete) {
            clearInterval(state.autoPlayInterval);
            state.autoPlayInterval = null;
            dom.autoplayBtn.textContent = 'Auto Play';
        } else {
            nextStep();
        }
    }, 1500);
}

dom.setupBtn.addEventListener('click', setupVisualization);
dom.nextBtn.addEventListener('click', nextStep);
dom.resetBtn.addEventListener('click', reset);
dom.autoplayBtn.addEventListener('click', autoPlay);
window.addEventListener('load', setupVisualization);