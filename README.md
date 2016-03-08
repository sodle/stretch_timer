# Timer and Counter for Repetitive Stretching Exercises

## Setting up
Deploy to any static webserver. Add your stretches below the TODO on line 180, overwriting the examples.

## Stretch types
You use the `add_stretch(name, reps, enable_timer, rep_time_sec, prep_time_sec)` method to configure the type of counting and timing for each exercise in your workout.

### Untimed stretches
Use only the first two arguments to `add_stretch`. Name your stretch, and put in the desired number of repetitions.

### Timed stretches
Use all five arguments. Name your stretch and specify the number of repetitions, then set `enable_timer` to true to denote a timed rep. `rep_time_sec` is the number of seconds that each rep should be held. `prep_time_sec` is the delay before the rep timer starts, allowing time to change position in between hitting the button and starting the stretch.

# Disclaimer
Not medical advice, not FDA approved, etc. etc. etc. 

I don't own the sound files. Apple does. DMCA me, Tim, I dare you.
