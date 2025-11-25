# QUIZ FOR MIDZ

This is the beta version of QUIZ FOR MIDZ, a Kahoot like quiz game that can take on unlimited users and questions. 

To play this game go to https://midn.cyber.usna.edu/~m265454/QuizForMidz/


If hosting a session, click host, then insert a test yaml file. Once everyone has joined, click start game.
Look below for an example yaml file. 


quiz_title: "General Knowledge & Media Quiz"
description: "A sample quiz testing geography and music recognition."

questions:
  - id: 1
    text: "Which city is shown in this image?"
    image_url: "https://example.com/images/eiffel_tower.jpg"
    music_url: null
    options:
      - answer: "London"
        is_correct: false
      - answer: "Paris"
        is_correct: true
      - answer: "Berlin"
        is_correct: false
      - answer: "Rome"
        is_correct: false

  - id: 2
    text: "Identify the composer of this piece."
    image_url: null
    music_url: "https://example.com/audio/beethoven_symphony_5.mp3"
    options:
      - answer: "Mozart"
        is_correct: false
      - answer: "Beethoven"
        is_correct: true
      - answer: "Bach"
        is_correct: false

  - id: 3
    text: "What represents the 'software' of a computer system?"
    image_url: "https://example.com/images/code_screen.png"
    music_url: "https://example.com/audio/typing_sounds.mp3"
    options:
      - answer: "The physical components"
        is_correct: false
      - answer: "The programs and operating information"
        is_correct: true
      - answer: "The electricity powering it"
        is_correct: false


