document.addEventListener('DOMContentLoaded', () => {
    const storyTextElement = document.getElementById('story-text');
    const choicesContainer = document.getElementById('choices-container');
    const commandInput = document.getElementById('command-input');
    const commandButton = document.getElementById('command-button');

    const gameState = {
        roomsCleared: 0,
        pace: 'standard',
        tone: 'pg13',
    };

    const config = {
        roomsToEscape: 5,
    };

    // Templates for generating random rooms. More can be added here.
    const roomTemplates = [
        () => ({
            text: `You enter a small, damp room. The only light comes from a single, bare bulb flickering overhead. In the center of the room is a wooden table with a rusty key on it. A heavy steel door is on the far wall.
            
A distorted voice crackles from a hidden speaker: "One step closer to the truth. But what door will this key unlock? The one in front of you, or the one in your past?"`,
            choices: [
                { text: 'Take the key and try the steel door.', outcome: 'progress' },
                { text: 'Ignore the key and inspect the walls for another way out.', outcome: 'progress' },
            ]
        }),
        () => ({
            text: `The floor is submerged in ankle-deep, murky water. The air is thick with the smell of mold. A narrow walkway of wooden planks leads to a door on the other side of the room.
            
The voice returns, colder this time: "You always thought you could walk above the filth. Let's see how well you keep your balance when the path is uncertain."`,
            choices: [
                { text: 'Carefully cross the walkway.', outcome: 'progress' },
                { text: 'Wade through the water to the door.', outcome: 'progress' },
            ]
        }),
        () => ({
            text: `This room is filled with clocks of all shapes and sizes, all ticking out of sync. The cacophony is maddening. One wall features a large, digital timer, currently off.
            
"So much time wasted," the voice whispers, "So many moments you can never get back. Are you finally ready to face the countdown?"`,
            choices: [
                { text: 'Search for a way to activate the timer.', outcome: 'progress' },
                { text: 'Smash the clocks to silence them.', outcome: 'progress' },
                { text: 'Look for an exit, ignoring the clocks.', outcome: 'progress' },
            ]
        }),
    ];

    const escapeScene = {
        text: `After clearing the last room, you find a simple, unlocked door. It opens to a staircase leading up. As you ascend, the air grows cleaner, and the distant sounds of the city reach your ears. You have escaped.
        
For now.`,
        choices: [
            { text: 'Play Again?', outcome: 'restart' }
        ]
    };
    
    const startScene = {
        text: `You wake up on a cold, tiled floor. Your cheek is pressed against something sticky, and the air smells faintly of bleach and rust.

When you try to sit up, a tug at your ankles stops you short. A chain clinks somewhere behind you, disappearing into the darkness. A small light blinks on across the room, illuminating a simple metal chair with a tape recorder sitting on the seat.

The recorder clicks. A distorted voice fills the room.
“You’ve spent years pretending your mistakes didn’t hurt anyone. Tonight, we find out how honest you’re willing to be.”`,
        choices: [
            { text: 'Crawl toward the chair.', outcome: 'progress' },
            { text: 'Feel along the wall for a door.', outcome: 'progress' },
            { text: 'Call out into the dark.', outcome: 'progress' }
        ]
    };

    function generateScene() {
        if (gameState.roomsCleared >= config.roomsToEscape) {
            return escapeScene;
        }

        // Present scenes in the order they are defined in the array.
        // The 'roomsCleared' count is used as an index for the next scene.
        if (gameState.roomsCleared < roomTemplates.length) {
            const nextSceneIndex = gameState.roomsCleared;
            return roomTemplates[nextSceneIndex]();
        } else {
            // If we've run out of unique rooms but haven't reached the escape number,
            // we can either end the game or, for this fix, just show the escape scene early.
            return escapeScene;
        }
    }

    function renderScene(scene) {
        storyTextElement.innerText = scene.text;
        choicesContainer.innerHTML = '';

        scene.choices.forEach(choice => {
            const button = document.createElement('button');
            button.innerText = choice.text;
            button.className = 'choice-button';
            button.addEventListener('click', () => {
                handleChoice(choice.outcome);
            });
            choicesContainer.appendChild(button);
        });
    }

    function handleChoice(outcome) {
        if (outcome === 'progress') {
            gameState.roomsCleared++;
            const nextScene = generateScene();
            renderScene(nextScene);
        } else if (outcome === 'restart') {
            init();
        }
        // Other outcomes like 'death' or 'item_gain' could be handled here
    }

    function handleCommand() {
        const command = commandInput.value.trim().toLowerCase();
        const parts = command.split(' ');
        const action = parts[0];

        if (action === '/pace') {
            const newPace = parts[1];
            if (newPace === 'fast' || newPace === 'standard') {
                gameState.pace = newPace;
                alert(`Pace set to ${gameState.pace}. (Feature not fully implemented)`);
            } else {
                alert('Invalid pace. Use "/pace fast" or "/pace standard".');
            }
        } else if (action === '/status') {
            alert(`Rooms Cleared: ${gameState.roomsCleared} / ${config.roomsToEscape}`);
        } else {
            alert('Unknown command. Try /status.');
        }
        commandInput.value = '';
    }

    commandButton.addEventListener('click', handleCommand);
    commandInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            handleCommand();
        }
    });

    function init() {
        gameState.roomsCleared = 0;
        renderScene(startScene);
    }

    init();
});