document.addEventListener('DOMContentLoaded', () => {
    const storyTextElement = document.getElementById('story-text');
    const choicesContainer = document.getElementById('choices-container');
    const commandInput = document.getElementById('command-input');
    const commandButton = document.getElementById('command-button');
    const sceneImageElement = document.getElementById('scene-image');

    const gameState = {
        roomsCleared: 0,
        pace: 'standard',
        tone: 'pg13',
    };

    // --- SCENE DEFINITIONS ---

    // Using a function to return a fresh copy of the templates array each time
    const getRoomTemplates = () => [
        {
            text: `You enter a small, damp room. The only light comes from a single, bare bulb flickering overhead. In the center of the room is a wooden table with a rusty key on it. A heavy steel door is on the far wall.\n\nA distorted voice crackles from a hidden speaker: "One step closer to the truth. But what door will this key unlock? The one in front of you, or the one in your past?"`,
            image: 'https://placehold.co/800x400/1a1a1a/c0c0c0?text=Damp+Room',
            choices: [
                { text: 'Take the key and try the steel door.', outcome: 'progress' },
                { text: 'Ignore the key and inspect the walls for another way out.', outcome: 'progress' },
            ]
        },
        {
            text: `The floor is submerged in ankle-deep, murky water. The air is thick with the smell of mold. A narrow walkway of wooden planks leads to a door on the other side of the room.\n\nThe voice returns, colder this time: "You always thought you could walk above the filth. Let's see how well you keep your balance when the path is uncertain."`,
            image: 'https://placehold.co/800x400/1a1a1a/c0c0c0?text=Flooded+Room',
            choices: [
                { text: 'Carefully cross the walkway.', outcome: 'progress' },
                { text: 'Wade through the water to the door.', outcome: 'progress' },
            ]
        },
        {
            text: `This room is filled with clocks of all shapes and sizes, all ticking out of sync. The cacophony is maddening. One wall features a large, digital timer, currently off.\n\n"So much time wasted," the voice whispers, "So many moments you can never get back. Are you finally ready to face the countdown?"`,
            image: 'https://placehold.co/800x400/1a1a1a/c0c0c0?text=Clock+Room',
            choices: [
                { text: 'Search for a way to activate the timer.', outcome: 'progress' },
                { text: 'Smash the clocks to silence them.', outcome: 'progress' },
                { text: 'Look for an exit, ignoring the clocks.', outcome: 'progress' },
            ]
        },
        {
            text: `The air grows cold, and you can see your breath. The walls are covered in a thin layer of frost. In the center of the room is a single, perfect ice sculpture of a person, their face etched in a silent scream.\n\nThe voice is almost a sigh: "Beauty in suffering. You of all people should understand that. Do you see a masterpiece, or a warning?"`,
            image: 'https://placehold.co/800x400/1a1a1a/c0c0c0?text=Frozen+Room',
            choices: [
                { text: 'Touch the ice sculpture.', outcome: 'progress' },
                { text: 'Look for the source of the cold.', outcome: 'progress' },
            ]
        },
        {
            text: `You step into a library. Bookshelves stretch from floor to ceiling, but all the books are blank, their pages empty. A single desk with a pen and an open, blank book sits under a reading lamp.\n\n"Your story is yet to be written," the voice says, "Or perhaps it has been erased. Here is your chance to set the record straight. What will you write?"`,
            image: 'https://placehold.co/800x400/1a1a1a/c0c0c0?text=Library+of+Blank+Books',
            choices: [
                { text: 'Sit and write in the book.', outcome: 'progress' },
                { text: 'Search the shelves for a book that is not blank.', outcome: 'progress' },
            ]
        },
        {
            text: `The room is a hall of mirrors. Your reflection stares back at you from a thousand different angles, distorted and warped. It's impossible to tell which way is forward.\n\n"Look at yourself," the voice mocks. "All those faces you've worn. Can you even remember which one is real? Find the true you."`,
            image: 'https://placehold.co/800x400/1a1a1a/c0c0c0?text=Hall+of+Mirrors',
            choices: [
                { text: 'Try to find a way through by touching the mirrors.', outcome: 'progress' },
                { text: 'Close your eyes and walk straight ahead.', outcome: 'progress' },
                { text: 'Shatter the nearest mirror.', outcome: 'progress' },
            ]
        }
    ];

    let currentRoomSequence = [];

    const config = {
        roomsToEscape: getRoomTemplates().length, // The game will use all available rooms
    };

    const escapeScene = {
        text: `After clearing the last room, you find a simple, unlocked door. It opens to a staircase leading up. As you ascend, the air grows cleaner, and the distant sounds of the city reach your ears. You have escaped.\n\nFor now.`,
        image: 'https://placehold.co/800x400/1a1a1a/c0c0c0?text=You+Have+Escaped',
        choices: [
            { text: 'Play Again?', outcome: 'restart' }
        ]
    };
    
    const startScene = {
        text: `You wake up on a cold, tiled floor. Your cheek is pressed against something sticky, and the air smells faintly of bleach and rust.\n\nWhen you try to sit up, a tug at your ankles stops you short. A chain clinks somewhere behind you, disappearing into the darkness. A small light blinks on across the room, illuminating a simple metal chair with a tape recorder sitting on the seat.\n\nThe recorder clicks. A distorted voice fills the room.\n“You’ve spent years pretending your mistakes didn’t hurt anyone. Tonight, we find out how honest you’re willing to be.”`,
        image: 'https://placehold.co/800x400/1a1a1a/c0c0c0?text=The+First+Room',
        choices: [
            { text: 'Crawl toward the chair.', outcome: 'progress' },
            { text: 'Feel along the wall for a door.', outcome: 'progress' },
            { text: 'Call out into the dark.', outcome: 'progress' }
        ]
    };

    // --- GAME LOGIC ---

    /**
     * Shuffles an array in place using the Fisher-Yates algorithm.
     * @param {Array} array The array to shuffle.
     */
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function generateScene() {
        if (gameState.roomsCleared >= config.roomsToEscape) {
            return escapeScene;
        }
        // Get the next scene from the pre-shuffled sequence
        const nextScene = currentRoomSequence[gameState.roomsCleared];
        return nextScene;
    }

    function renderScene(scene) {
        sceneImageElement.src = scene.image;
        sceneImageElement.alt = scene.text.substring(0, 50); // Use start of text for alt
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
        
        // Create a fresh, shuffled sequence of rooms for this playthrough
        currentRoomSequence = getRoomTemplates();
        shuffleArray(currentRoomSequence);

        renderScene(startScene);
    }

    init();
});