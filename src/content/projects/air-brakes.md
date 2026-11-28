---
title: Air Brakes
order: 1
featured: true
heroImage: /media/images/airbrakes-nextpcb-2026.webp
sections:
  - type: textBand
    theme: warm-light
    text: >-
      ## Abstract


      The Air Brakes control system primarily manages the vehicle’s energy state
      throughout its unpowered ascent phase of flight by modulating the rocket’s
      aerodynamic drag profile in a bid to regulate its apogee to the specified
      target of 10,000 ft AGL with a tolerance of ± 500 ft. At the 2025 IREC,
      Clarkson University Rocketry (CUR) launched Veðrfölnir, last year’s rocket
      and Air Brakes iteration, to an apogee of 10,352 ft, successfully
      achieving our apogee target goal. This year, CUR returns with the
      improvements detailed below with the intention of again improving our
      apogee accuracy through further control system development.


      The complete Air Brakes system includes a mechanical assembly engineered
      for fail-safe, symmetric brake flap deployment, a refined electronics
      hardware design, and an improved control algorithm responsible for state
      estimation of the rocket, apogee prediction, and continuously variable
      PI-controller generating actuation commands. Throughout the development
      cycle, the team focused on building off of prior successes and expanding
      novelconcepts, while ensuring Air Brakes safety and working within
      manufacturability and integration constraints.
    divider:
      style: concave-up
      stroke: none
  - type: splitBand
    theme: white
    imageSide: left
    image: /media/images/air-brakes-exploded.png
    caption: Exploded view of air brakes coupler stack
    text: >-
      ## Mechanical Design


      The mechanical assembly of the Air Brakes system consists of four
      symmetrically arranged brake flaps deployed radially into the airstream
      surrounding the rocket body. With a total wetted area of 10.18 in², the
      total drag force on the rocket nearly doubles to a maximum of 222.6 lbf if
      deployed after burnout, providing the necessary energy dissipation to
      reduce apogee. A primary design considerations included the need for
      airflow to reattach to the fins to maintain stable flight during
      deployment, which was validated with CFD analysis and two years of flight
      heritage. The brake flaps ride along linear rails to bear the aerodynamic
      load and are deployed by a high-speed, high-torque, and dust-rated servo
      motor, which rotates a central hub connected by linkages to the flaps. The
      chosen servo was tested under load to fully deploy in only 0.3 seconds,
      and has been upgraded since last year with a feedback signal allowing the
      microcontroller to measure true deployment as well as detect and mitigate
      brake flap binding. The system continues to integrate compactly within the
      rocket airframe, adding only 1.75 in to the rocket’s overall length while
      featuring an increased upper coupler bonded length of 2 in.
    divider:
      style: concave-down
      stroke: gold
  - type: splitBand
    theme: green
    imageSide: left
    image: /media/images/airbrakemodportrait.png
    caption: Air Brakes control system PCB
    text: The Air Brakes control system PCB is a self-contained, custom electronics
      solution fulfilling DTEG and team-imposed constraints while providing
      power supply, state sensing and control logic, and user interface
      functionality. To further mitigate effects of recovery shock or vibration
      on power supply, the onboard 18650 batteries have been replaced with an
      integrated external Li-ion pack mounted beside the revised half-size PCB.
      Pre-launch testing procedures are facilitated through a user interface
      with four push buttons, an eight-position rotary mode selector switch for
      user input as well as two RGB LEDs and an externally audible buzzer for
      feedback. An STM32H730 MCU was chosen for its I/O count and double
      precision floating point unit, and is paired with an ST LPS22DF barometer,
      LSM6DSV80X IMU, and IIS2MDC magnetometer with easy-to-integrate drivers.
    divider:
      style: wavy
      stroke: none
  - type: splitBand
    theme: white
    imageSide: left
    image: /media/images/control-system-simulink.png
    caption: Overview of rocket plant Simulink model and control system stages
    text: >-
      ## State Estimation and Control System


      The control system was prototyped within our Modeling and Simulation
      subteam’s Simulink model and later ported to C code for use on the STM32
      MCU, taking advantage for the first time of ARM-optimized CMSIS-DSP
      functions for matrix processing.


      The state estimation system must take into account the orientation of the
      implemented sensors on the PCB relative to the body frame for proper
      interpretation of IMU and magnetometer data, using these body frame
      variables as inputs to a Madgwick filter sensor fusion AHRS, which uses
      this acceleration, angular rate, and magnetic flux data to estimate a body
      frame to inertial (earth) frame rotation quaternion. While the IMU alone
      is sufficient for pitch and roll estimation, the magnetometer records
      magnetic flux density to the end of determining the magnetic north
      direction to complement the IMU’s strengths.


      This orientation quaternion is normalized and used for vector rotation to
      convert measured acceleration in the body frame to an inertial frame
      estimate. This estimated acceleration in the inertial frame is a necessary
      input to the next stage of the control system: the Kalman filter. A
      two-state Kalman filter was implemented to estimate the rocket's current
      altitude and vertical velocity, and in a similar way to the Madgwick
      filter, the Kalman filter is implemented as two separate functions to
      allow the prediction step—based on high-ODR accelerometer data—to be  

      decoupled from the correction step which relies on the slower barometer
      data updates.


      As the final component of the state estimation subsystem, a launch detect
      function was incorporated to identify the beginning of flight,
      differentiating between unintentional movement of the rocket and actual
      launch. If the rocket experiences a significant acceleration in the body
      +X direction and increase in barometric altitude, launch detect is
      triggered. When launch detect is triggered, the time since system power on
      is stored as the launch time, and the mission elapsed time afterwards is
      calculated by subtracting the launch time from the time since power on.


      Building off of data from the state estimation system, the control system
      relies on the Kalman filter’s altitude and vertical to predict the
      rocket's eventual apogee using a simplified lightweight model for a
      projectile with drag. The air density ρ is calculated based on the
      International Standard Atmosphere (ISA) model, using the Kalman filter AGL
      altitude output as the height input. Drag force is then calculated based
      on the air density from this model, the vertical velocity from the Kalman
      filter, and the constant tunable drag coefficient and reference area of
      the rocket.


      The tunable drag coefficient allows for this model to be adjusted to
      produce a response that resembles a step function as closely as possible,
      allowing for the fastest apogee prediction. The contribution to
      acceleration by drag is calculated assuming the empty mass of the rocket,
      as the motor has already burned all fuel when the control system is
      enabled, according to the lockout conditions described below. The
      predicted apogee is calculated as a projectile affected by both drag and
      gravity, and is used as an input to the Air Brakes deployment PI
      controller, which subtracts from this the target apogee to use as an error
      function.


      In order to comply with DTEG requirements as well as reduce control system
      uncertainty near apogee, an Air Brakes lockout subsystem places checks on
      the controller's output to the brake actuation servo. These gates prevent
      deployment of the Air Brakes if the rocket is still in the powered ascent
      phase of flight which is sensed using both the body +X acceleration in
      addition to a minimum 4-second timer. They also retract the Air Brakes if
      the vertical velocity is slow near apogee where the brakes are
      ineffective, or if the rocket's attitude exceeds 30 degrees from launch
      elevation as estimated by the Madgwick filter.


      The Air Brakes deployment controller follows a typical PID structure, but
      with the derivative component removed (i.e. gain set to 0) to avoid over
      correction or oscillation that may make achieving the target apogee
      impossible. Instead, small Kp and Ki gains are used to drive the servo
      motor to decrease this error function, and the integral term includes both
      anti-windup protection, limiting its contribution to deployment to a
      maximum of 50% and also resetting the integral term any time the predicted
      apogee is below the target apogee.
    divider:
      style: chevron
      stroke: green
  - type: textBand
    theme: warm-dark
    text: Analysis of components of the Air Brakes system as well as testing with
      simulated inputs to, and outputs from, the control system provide strong
      evidence that this year’s iterated design will fulfill its primary
      objectives. The launch of our previous rockets competing at IREC, Currera
      and Veðrfölnir, have flight-tested previous iterations of the air brake
      design, allowing the team to target more specific improvements this year.
      These flights demonstrated controllable drag modulation while maintaining
      stability. This year’s improved electronics allow for the implementation
      of a more complete control system, along with a flight-tested mechanical
      flap design. While the team aimed to flight test the Air Brakes on a
      testbed rocket this year, weather circumstances prevented this from
      occurring. Future research and development will involve a testbed flight
      with the Air Brakes so further flight testing can be conducted for the
      purposes of validating and refining the control algorithm tuning based on
      real-world data.
    divider:
      style: none
      stroke: none
---
