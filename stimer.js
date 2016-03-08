// Far from my best code, I know.

var start_beep = new Audio('Hero.mp3');
var finish_ding = new Audio('Ping.mp3');
var set_finish_ding = new Audio('Glass.mp3');

var stretch_timer = {};

stretch_timer.timer_state = {
  NOT_STARTED: 0,
  RUNNING_PREP: 1,
  RUNNING_REP: 2,
  DONE: 3,
  NO_TIMER: 4
};

stretch_timer.timer = function(name, num_reps, enable_timer, rep_time, prep_time) {
  var self = this;

  this.timer_running = false;
  this.prep_time_remaining = prep_time;
  this.rep_time_remaining = rep_time;
  this.reps_completed = 0;

  this.get_name = function() {return name;};
  this.get_reps_total = function() {return num_reps;};
  this.get_reps_completed = function() {return this.reps_completed;};
  this.get_timer_state = function() {
    if (!enable_timer) return {
      state: stretch_timer.timer_state.NO_TIMER,
      prep_remaining: 0,
      rep_remaining: 0
    };

    var timer_state = -1;
    if (this.timer_running) {
      if (this.prep_time_remaining > 0)
        timer_state = stretch_timer.timer_state.RUNNING_PREP;
      else if (this.rep_time_remaining > 0)
        timer_state = stretch_timer.timer_state.RUNNING_REP;
    } else {
      timer_state = (this.prep_time_remaining == this.rep_time_remaining == 0) ? stretch_timer.timer_state.DONE : stretch_timer.timer_state.NOT_STARTED;
    }
    return {
      state: timer_state,
      prep_remaining: this.prep_time_remaining,
      rep_remaining: this.rep_time_remaining
    };
  };

  this.count_rep = function() {
    if (!enable_timer) {
      this.reps_completed++;
      if (this.reps_completed == num_reps)
        set_finish_ding.play();
      else
        finish_ding.play();
    } else
      this.timer_running = true;
  };

  this.timer_loop = function() {
    if (self.timer_running) {
      if (self.prep_time_remaining > 0 && !self.prep_start_time)
        self.prep_start_time = Date.now();
      if (self.prep_time_remaining == 0 && self.rep_time_remaining > 0 && !self.rep_start_time)
        self.rep_start_time = Date.now();

      if (self.prep_time_remaining > 0) {
        self.prep_time_remaining = prep_time - (Date.now() - self.prep_start_time);
      } else {
        self.prep_time_remaining = 0;
        if (!self.beeped) {
          start_beep.play();
          self.beeped = true;
        }
        self.prep_start_time = null;

        if (self.rep_start_time) {
          if (self.rep_time_remaining > 0) {
            self.rep_time_remaining = rep_time - (Date.now() - self.rep_start_time);
          } else {
            self.rep_time_remaining = 0;
            self.timer_running = false;
            self.rep_start_time = null;
            self.prep_start_time = null;
            self.rep_time_remaining = rep_time;
            self.prep_time_remaining = prep_time;
            self.reps_completed++;
            if (self.reps_completed == num_reps)
              set_finish_ding.play();
            else
              finish_ding.play();
            self.beeped = false;
          }
        }
      }
    }
    self.anim_frame = requestAnimationFrame(self.timer_loop);
  };
  this.anim_frame = requestAnimationFrame(this.timer_loop);
};

// Too lazy for Angular
stretch_timer.view_model = function(timer_obj) {
  this.timer_obj = timer_obj;

  var list_item = document.createElement('div');
  var $listitem = $(list_item);
  $listitem.addClass('stretch_li');

  var repcount_view = document.createElement('div');
  var $repcountview = $(repcount_view);
  $repcountview.addClass('stretch_repcount');
  $listitem.append(repcount_view);
  function draw_repcount() {
    $repcountview.html(timer_obj.get_reps_completed() + ' / ' + timer_obj.get_reps_total() + '<br />reps');
    $repcountview.attr('completed', timer_obj.get_reps_completed() == timer_obj.get_reps_total());
    draw_repcount_frame = requestAnimationFrame(draw_repcount);
  }
  var draw_repcount_frame = requestAnimationFrame(draw_repcount);

  var stretchname_view = document.createElement('div');
  var $stretchnameview = $(stretchname_view);
  $stretchnameview.text(timer_obj.get_name());
  $stretchnameview.addClass('stretch_name');
  $listitem.append(stretchname_view);

  var stretchtime_view = document.createElement('div');
  var $stretchtimeview = $(stretchtime_view);
  $stretchtimeview.addClass('stretch_time');
  $listitem.append(stretchtime_view);
  if (timer_obj.get_timer_state().state != stretch_timer.timer_state.NO_TIMER) {
    function draw_timer() {
      var timestate = timer_obj.get_timer_state();
      switch (timestate.state) {
        case stretch_timer.timer_state.RUNNING_PREP: {
          $stretchtimeview.html('Ready<br/>:' + Math.ceil(timestate.prep_remaining / 1000));
          $stretchtimeview.attr('state', 'prep');
          break;
        }
        case stretch_timer.timer_state.RUNNING_REP: {
          $stretchtimeview.html('Stretch<br/>:' + Math.ceil(timestate.rep_remaining / 1000));
          $stretchtimeview.attr('state', 'rep');
          break;
        }
        default: {
          $stretchtimeview.text(':' + Math.ceil(timestate.rep_remaining / 1000));
          $stretchtimeview.attr('state', 'stop');
        }
      }
      draw_timer_frame = requestAnimationFrame(draw_timer);
    }
    var draw_timer_frame = requestAnimationFrame(draw_timer);
  }

  var stretchstart_btn = document.createElement('button');
  var $stretchstartbtn = $(stretchstart_btn);
  $stretchstartbtn.addClass('stretch_start');
  $stretchstartbtn.text((timer_obj.get_timer_state().state == stretch_timer.timer_state.NO_TIMER) ? 'Count' : 'Start');
  $stretchstartbtn.click(function () {
    timer_obj.count_rep();
  });
  $listitem.append(stretchstart_btn);
  function draw_start_btn() {
    $stretchstartbtn.attr('disabled', timer_obj.timer_running);
    draw_start_btn_frame = requestAnimationFrame(draw_start_btn);
  }
  var draw_start_btn_frame = requestAnimationFrame(draw_start_btn);

  $('body').append(list_item);
};

function add_stretch(name, reps, enable_timer, rep_time_sec, prep_time_sec) {
  var sobj = new stretch_timer.timer(name, reps, enable_timer, rep_time_sec * 1000, prep_time_sec * 1000);
  return new stretch_timer.view_model(sobj);
}


// TODO: Replace these with your real exercises
var stretch_kick = add_stretch('Kick', 10);
var stretch_cross_over = add_stretch('Cross over', 10, true, 30, 3);
