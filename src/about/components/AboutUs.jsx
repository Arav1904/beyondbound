import React from 'react';
import StoryIntro from './StoryIntro';
import OurStory from './OurStory';
import TheJourney from './TheJourney';
import MissionVision from './MissionVision';
import HowWeFormulate from './HowWeFormulate';
import WhatWeStandBy from './WhatWeStandBy';
import OurTeam from './OurTeam';
import Partner from './Partner';
import '../css/AboutUs.css';

const AboutUs = () => {
  return (
    <div className="about-us-page">
      <StoryIntro />
      <OurStory />
      <TheJourney />
      <MissionVision />
      <HowWeFormulate />
      <WhatWeStandBy />
      <OurTeam />
      <Partner />
    </div>
  );
};


export default AboutUs;

