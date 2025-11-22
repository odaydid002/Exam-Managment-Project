'use client'
import React,{useEffect, useRef, useState} from 'react';
import { useNavigate } from "react-router-dom";

import gsap from 'gsap';

import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

import styles from './home.module.css';

import Landing from '../components/containers/Landing';
import Footer from '../components/Footer';
import Logo from '../components/images/Logo';
import PrimaryButton from '../components/buttons/PrimaryButton';
import RoundedText from '../components/text/RoundedText';
import TextButton from '../components/buttons/TextButton';
import Eclipse from '../components/shapes/Eclipse';

import alger from '../assets/alger.png'
import oran from '../assets/oran.png'
import tlemcen from '../assets/tlemcen.png'
import boumerdace from '../assets/boumerdace.png'
import FeatureCard1 from '../components/containers/FeatureCard1';
import FeatureCard2 from '../components/containers/FeatureCard2';
import FeatureCard3 from '../components/containers/FeatureCard3';

import formatNumber from '../hooks/formatNumber'

const Home = () => {
  const bg = "linear-gradient(to bottom,var(--grad1), var(--grad2))";

  window.addEventListener("load", () => {
    ScrollTrigger.refresh();
    window.scrollTo(document.body.clientHeight*4, document.body.clientHeight*4);
    setTimeout(() => {
        window.scrollTo(0, 0);
    }, 100);
  });

  const [schedulePlanned, setSp] = useState (10000);
  const [dailyRequest, setDr] = useState (100000000);
  const [conflictRatio, setCr] = useState (5);
  const [studentRegistred, setSr] = useState (520000);

  const section1 = useRef(null);
  const section2 = useRef(null);
  const section3 = useRef(null);
  const section4 = useRef(null);
  const section5 = useRef(null);
  const section6 = useRef(null);
  const image1 = useRef(null);
  const image2 = useRef(null);
  const image3 = useRef(null);
  const image4 = useRef(null);
  const image5 = useRef(null);
  const image6 = useRef(null);
  const title1 = useRef(null);
  const title2 = useRef(null);
  const title3 = useRef(null);
  const title4 = useRef(null);
  const title5 = useRef(null);
  const title6 = useRef(null);
  const paragraph1 = useRef(null);
  const paragraph2 = useRef(null);
  const paragraph3 = useRef(null);
  const paragraph4 = useRef(null);
  const paragraph5 = useRef(null);
  const paragraph6 = useRef(null);
  const paragraph7 = useRef(null);
  const paragraph8 = useRef(null);
  const paragraph9 = useRef(null);
  const shape1 = useRef(null);
  const shape2 = useRef(null);
  const shape3 = useRef(null);
  const shape4 = useRef(null);
  const card1 = useRef(null);
  const card2 = useRef(null);
  const card3 = useRef(null);
  const card4 = useRef(null);
  const card5 = useRef(null);
  const card6 = useRef(null);
  const card7 = useRef(null);
  const card8 = useRef(null);
  const card9 = useRef(null);

  useEffect(() => {
    const sh1 = shape1.current;
    const sh2 = shape2.current;
    const sh3 = shape3.current;
    const sh4 = shape4.current;
    const sec1 = section1.current;
    const sec2 = section2.current;
    const sec3 = section3.current;
    //const sec4 = section4.current;
    const sec5 = section4.current;
    const sec6 = section4.current;
    const el1 = image1.current;
    const el2= title1.current;
    const el3 = title2.current;
    const el4 = paragraph1.current;
    const el5 = paragraph2.current;
    const el6 = image2.current;
    const el7 = image3.current;
    const el8 = image4.current;
    const el9 = image5.current;
    const el10 = paragraph3.current;
    const el11 = title3.current;
    const el12 = paragraph4.current;
    const el13 = card1.current;
    const el14 = card2.current;
    const el15 = card3.current;
    const el16 = paragraph5.current;
    const el17 = title4.current;
    const el18 = paragraph6.current;
    const el19 = image6.current;
    const el20 = card4.current;
    const el21 = card5.current;
    const el22 = card6.current;
    const el23 = card7.current;
    const el24 = card8.current;
    const el25 = card9.current;
    const el26 = paragraph7.current;
    const el27 = title5.current;
    const el28 = paragraph8.current;
    const el29 = title6.current;
    const el30 = paragraph9.current;

    const ctx = gsap.context(() => {
          gsap.set(sh1, {y: 100, x:800, zIndex: 10})
          gsap.from(sh1, {
            y: -20,
            opacity: 1,
            duration: 1,
            scrollTrigger: {
              start: "top top",
              scrub: 2,
              trigger: sec1,
            },
          })
          gsap.set(sh2, {y: 0})
          gsap.from(sh2, {
            y: -500,
            opacity: 1,
            duration: 1,
            scrollTrigger: {
              start: "top bottom",
              scrub: 6,
              trigger: sec5,
            },
          })
          gsap.set(sh3, {y: 0, zIndex: 10})
          gsap.from(sh3, {
            y: 500,
            opacity: 1,
            duration: 1,
            scrollTrigger: {
              start: "top bottom",
              scrub: 6,
              trigger: sec6,
            },
          })
          gsap.set(sh4, {y: 0, zIndex: 10})
          gsap.from(sh4, {
            y: -500,
            opacity: 1,
            duration: 1,
            scrollTrigger: {
              start: "center bottom",
              scrub: 6,
              trigger: sec6,
            },
          })
          gsap.set(el1, {opacity: 0, x: 1000})
          gsap.from(el1, {
            x: 400,
            opacity: 1,
            duration: 1,
            scrollTrigger: {
              start: "top top",
              scrub: 2,
              trigger: sec1,
            },
          })
          gsap.set([el2, el3], {y: 0,opacity: 1})
          gsap.to([el2, el3], {
            y: -200,
            opacity: 0,
            duration: 1,
            stagger: 0.1,
            scrollTrigger: {
              start: "top top",
              scrub: 2,
              trigger: sec1,
            },
          });
          gsap.set(el4, {y: 0,opacity: 1})
          gsap.to(el4, {
            y: 100,
            opacity: 0,
            duration: 1,
            scrollTrigger: {
              start: "top top",
              scrub: 1,
              trigger: sec1,
            },
          });
          gsap.set(el5, {y: -50,opacity: 0})
          gsap.to(el5, {
            y: 0,
            opacity: 1,
            duration: 1,
            scrollTrigger: {
              start: "bottom 80%",
              scrub: 1,
              trigger: sec2,
            },
          });
          gsap.set([el6, el7, el8, el9], {y: 50,opacity: 0})
          gsap.to([el6, el7, el8, el9], {
            y: 0,
            opacity: 1,
            duration: 1,
            stagger: 0.5,
            scrollTrigger: {
              start: "top bottom",
              scrub: 1,
              trigger: el5,
            },
          });
          gsap.set([el10, el11, el12], {y: 50,opacity: 0})
          gsap.to([el10, el11, el12], {
            y: 0,
            opacity: 1,
            duration: 1,
            stagger: 0.5,
            scrollTrigger: {
              start: "bottom center",
              scrub: 1,
              trigger: sec2,
            },
          });
          gsap.set([el13, el14, el15], {y: -50,opacity: 0})
          gsap.to([el13, el14, el15], {
            y: 0,
            opacity: 1,
            duration: 1,
            stagger: 0.5,
            scrollTrigger: {
              start: "top bottom",
              scrub: 1,
              trigger: el12,
            },
          });
          gsap.set([el16, el17, el18], {y: 50,opacity: 0})
          gsap.to([el16, el17, el18], {
            y: 0,
            opacity: 1,
            duration: 1,
            stagger: 0.5,
            scrollTrigger: {
              start: "bottom center",
              scrub: 1,
              trigger: sec3,
            },
          });
          gsap.set(el19, {y: -50,opacity: 0})
          gsap.to(el19, {
            y: 0,
            opacity: 1,
            duration: 1,
            scrollTrigger: {
              start: "top center",
              scrub: 1,
              trigger: el18,
            },
          });
          gsap.set([el20, el21, el22, el23, el24, el25], {y: 50,opacity: 0})
          gsap.to([el20, el21, el22, el23, el24, el25], {
            y: 0,
            opacity: 1,
            duration: 1,
            stagger: 0.5,
            scrollTrigger: {
              start: "top center",
              scrub: 1,
              trigger: el19,
            },
          });
          gsap.set([el26, el27, el28], {y: 50,opacity: 0})
          gsap.to([el26, el27, el28], {
            y: 0,
            opacity: 1,
            duration: 1,
            stagger: 0.5,
            scrollTrigger: {
              start: "bottom top",
              scrub: 3,
              trigger: sec5,
            },
          });
          gsap.set([el29, el30], {opacity: 0})
          gsap.to([el29, el30], {
            opacity: 1,
            duration: 1,
            stagger: 0.1,
            scrollTrigger: {
              start: "top bottom",
              scrub: 5,
              trigger: el29,
            },
          });

      });
      return () => ctx.revert();
    }, []);

  useEffect(() => {
    const sec = paragraph7.current;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sec,
        start: "top bottom",
        onEnter: () => {
          const startTime = performance.now();
          function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / 2000, 1);
            const currentCr = Math.floor(0 + (conflictRatio - 0) * progress);
            const currentDr = Math.floor(0 + (dailyRequest - 0) * progress);
            const currentSp = Math.floor(0 + (schedulePlanned - 0) * progress);
            const currentSr = Math.floor(0 + (studentRegistred - 0) * progress);
            setCr(currentCr);
            setDr(currentDr);
            setSp(currentSp);
            setSr(currentSr);
            if (progress < 1) {
              requestAnimationFrame(update);
            }
          }
          requestAnimationFrame(update);
        },
      });
    });

    return () => ctx.revert();
  }, []);
  const navigate = useNavigate();
  return (
    <Landing scrollBar={false} pd='0' bg={bg} css = "flex column a-center pos-rel overflow-h">
      <Eclipse w='40em' size='4em' top="-15em" right="-5em" css="pos-abs"/>
      <Eclipse w='15em' size='2em' top="-5em" left="-5em" css="pos-abs"/>
      <Eclipse w='12em' size='2em' top="50vh" left="40%" css="pos-abs anim-float"/>
      <div ref={shape1}>
        <Eclipse w='20em' size='2em' top="70vh" right="-5em" zi='10' color='var(--border)' css="pos-abs"/>
      </div>
      <section ref={section1} className='full-view-min flex row a-center pos-rel pdh-2'>
        <div className={`${styles.header} flex column`}>
          <Logo forceLight={true} w='40' wc='fit-content' />
          <div className="flex row a-center pdv-2">
            <RoundedText textColor='white' text="What's new" fontSize='0.7rem'/>
            <TextButton textColor='white' text='Just shipped v1.0 >' mrg='0 2em' underline={true}/>
          </div>
          <h3 ref={title1} className={styles.titleXl}>Simplified</h3>
          <h3 ref={title2} className={styles.titleXl}>exam scheduling</h3>
          <p ref={paragraph1} className={styles.para}>Transform your department's exam management with our centralized web platform. Say goodbye to scheduling conflicts, planning errors, and excessive administrative burden. A modern solution for optimal organization.</p>
          <div className="flex row a-center">
            <PrimaryButton text='Get started' type='button' onClick={() => navigate("/login")}/>
            <TextButton textColor='white' text='Learn more >' mrg='0 2em'/>
          </div>
        </div>
        <div ref={image1} className={`${styles.imageContainer1} flex row center`}></div>
      </section>
      <section ref={section2} className='w100 flex column center pdv pos-rel'>
        <Eclipse w='50em' size='2em' top="100%" left="-20%" css="pos-abs anim-float"/>
        <h6 ref={paragraph2} className='text-white text-l pdv mrh'>The world&apos;s most innovative univercities use our app</h6>
        <ul className={`no-style-list flex row center w100`}>
          <img className={styles.boxImage} ref={image2} src={tlemcen} alt="Univercity Tlemcen" />
          <img className={styles.boxImage} ref={image3} src={boumerdace} alt="Univercity Boumerdace" />
          <img className={styles.boxImage} ref={image4} src={alger} alt="Univercity Alger" />
          <img className={styles.boxImage} ref={image5} src={oran} alt="Univercity Oran" />
        </ul>
      </section>
      <section ref={section3} className='full-view-min flex column center pdv pos-rel'>
          <h6 ref={paragraph3} className='cMain text-l pdv'>Student View</h6>
          <h3 ref={title3} className='text-a-c text-white text-xxl'>Check your exams <br/> with ease</h3>
          <p ref={paragraph4} className={styles.para} style={{maxWidth:"60vw"}}>Our system accounts for all constraints: room availability, teacher schedules, student groups, and exam types. Schedule your sessions in just a few clicks and view all details in real-time.</p>
          <div className="flex row w100 center wrap pdv mrv">
            <div ref={card1} className="flex center">
              <FeatureCard1 textColor="white" mrg='1em' icon="fa-solid fa-bolt" title='Smart scheduling' desc='Automate exam scheduling considering room availability, teacher schedules, and student groups. Avoid timetable conflicts with our intelligent system.' onClick={()=>{}} />
            </div>
            <div ref={card2} className="flex center">
              <FeatureCard1 textColor="white" mrg='1em' icon="fa-solid fa-user-group" title='Centralized collaboration' desc='Facilitate coordination between teachers, scheduling coordinators, and students. All exam information accessible in one central place.' onClick={()=>{}} />
            </div>
            <div ref={card3} className="flex center">
              <FeatureCard1 textColor="white" mrg='1em' icon="fa-solid fa-calendar-days" title='Simplified management' desc='Easily manage exam sessions (written, practical, retakes) with an intuitive interface. Dramatically reduce administrative workload.' onClick={()=>{}} />
            </div>
          </div>
      </section>
      <section ref={section4} className='full-view-min flex column center pdv pos-rel'>
        <div ref={shape2}>
          <Eclipse w='20em' size='2em' top="50%" left="20em" css="pos-abs"/>
        </div>
        <div ref={shape3}>
          <Eclipse w='10em' size='1em' top="40em" left="-40em" css="pos-abs"/>
        </div>
        <h6 ref={paragraph5} className='cMain text-l pdv'>Administration View</h6>
        <h3 ref={title4} className='text-a-c text-white text-xxl'>Full control over <br/> your organization</h3>
        <p ref={paragraph6} className={styles.para} style={{maxWidth:"60vw"}}>Complete administration interface to manage modules, teachers, rooms, and all system parameters. Generate detailed reports and track scheduling progress in real-time.</p>
        <div ref={image6} className={`${styles.imageContainer2} flex row center mrv`}></div>
      </section>
      <section ref={section5} className='w100 flex row wrap a-start gap-2 j-center pdv pos-rel'>
        <div ref={shape4}>
          <Eclipse w='30em' size='2em' top="0" left="80em" css="pos-abs"/>
        </div>
        <div ref={card4} className="flex center">
          <FeatureCard2 textColor='white' icon="fa-solid fa-user-shield" title='Role-Based Security' desc="Fine-grained access control with secure authentication, encrypted sessions, and strict permission separation between Chef, Responsable, Enseignant, and Étudiant."/>
        </div>
        <div ref={card5} className="flex center">
          <FeatureCard2 textColor='white' icon="fa-solid fa-screwdriver-wrench" title='Conflict Engine' desc="A smart algorithm that automatically detects scheduling conflicts (rooms, teachers, groups, time overlaps) and proposes optimal alternatives."/>
        </div>
        <div ref={card6} className="flex center">
          <FeatureCard2 textColor='white' icon="fa-solid fa-gear" title='REST API' desc=" Full internal API enabling seamless integration with other university systems (student database, authentication services, reporting tools)"/>
        </div>
        <div class="flex-break"></div>
        <div ref={card7} className="flex center">
          <FeatureCard2 textColor='white' icon="fa-solid fa-boxes-packing" title='Resource Optimization' desc="AI-assisted allocation of rooms and surveillants based on availability, capacity, constraints, and workload balancing."/>
        </div>
        <div ref={card8} className="flex center">
          <FeatureCard2 textColor='white' icon="fa-solid fa-bell" title='Real-Time Alerts' desc=" Instant push notifications and email alerts triggered by schedule changes, new exam assignments, or updates, ensuring everyone stays informed."/>
        </div>
        <div ref={card9} className="flex center">
          <FeatureCard2 textColor='white' icon="fa-solid fa-hand-sparkles" title='Responsive UI' desc="A modern, accessible UI optimized for desktop, tablet, and mobile, allowing students and teachers to consult their schedules from any device."/>
        </div>

      </section>
      <section ref={section6} className={`full-view-min flex column pd j-center ${styles.specSec} pos-rel`}>
        <Eclipse w='10em' size='1em' top="70%" left="50%" css="pos-abs anim-float"/>
        <h6 ref={paragraph7} className='cMain text-l pdv'>Our track record</h6>
        <h3 ref={title5} className='text-white text-xxl'>Trusted by thousands of <br/> students worldwide</h3>
        <p ref={paragraph8} className={styles.para} style={{maxWidth:"60vw"}}>Our exam management platform delivers reliable scheduling, real-time updates, and a seamless user experience. Built with accuracy and transparency at its core, it ensures every student can depend on fair, organized, and stress-free exam coordination.</p>
        <div className="flex row center gap-2 wrap pdv mrv">
          <FeatureCard3 textColor='white' title={`${formatNumber(schedulePlanned)}+`} desc='Schedule planned' />
          <FeatureCard3 textColor='white' title={`${formatNumber(dailyRequest)}+`} desc='Daily requests' />
          <FeatureCard3 textColor='white' title={`${conflictRatio}%`} desc='Conflict ratio' />
          <FeatureCard3 textColor='white' title={`${formatNumber(studentRegistred)}+`} desc='Student registered' />
        </div>
      </section>
      <section className='full-view-min flex column center pdv pos-rel'>
        <Eclipse w='30em' size='2em' top="0" left="-10%" css="pos-abs"/>
        <Eclipse w='8em' size='1em' top="50%" left="50%" css="pos-abs anim-float"/>
        <Eclipse w='20em' size='2em' top="90%" right="-10%" css="pos-abs"/>
        <h3 ref={title6} className='text-a-c text-white text-xxl'>Boost your productivity <br/> Start using our app today</h3>
        <p ref={paragraph9} className={styles.para} style={{maxWidth:"60vw"}}>Work smarter, not harder. Get started with our app and instantly boost your productivity with streamlined tools designed to simplify your tasks and keep you focused.</p>
         <div className="flex row a-center">
          <PrimaryButton text='Get started' type='button' onClick={() => navigate("/login")}/>
          <TextButton textColor='white' text='Learn more >' mrg='0 2em'/>
        </div>
      </section>
      <Footer forceLight={true} facebook='#' instagram='#' github='#' youtube='#' linkedin='#' />
    </Landing>
    
  )
}

export default Home