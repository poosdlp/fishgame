import { useEffect, useRef, useState } from "react";
import type { Fishy } from "../types/fish";
import { LakeWidth, LakeHeight } from "../data/lakeDim";

export function useFishSimulation(bobber: { x: number; y: number } | null) {
  const [fishInLake, setFishInLake] = useState<Fishy[]>([]);
  const [targetFishId, setTargetFishId] = useState<string | null>(null);
  const bobberRef = useRef<{ x: number; y: number } | null>(null);
  const hoverQueueRef = useRef<string[]>([]);

  useEffect(() => {
    bobberRef.current = bobber;
    let animationId: number;
    let time = 0;

    const update = () => {
      
      time += 1; 

      if(!targetFishId && hoverQueueRef.current.length===2 ){
          const rand = Math.floor(Math.random() * 2);
            setTargetFishId(hoverQueueRef.current[rand]);
        }
        if(!targetFishId && hoverQueueRef.current.length===1){
          const firstfish= fishInLake.find(f => f.id === hoverQueueRef.current[0]);
          if(firstfish && firstfish.tapCount >= firstfish.requiredTaps){
            setTargetFishId(hoverQueueRef.current[0]);
          }
        }
    
      setFishInLake(prev => 
        prev.map(fish => {
          //console.log("fish count:", prev.length);
          const bobber = bobberRef.current;
          // console.log("bobber in update:", bobber);
          // console.log("bobber location", bobber ? `(${bobber.x.toFixed(2)}, ${bobber.y.toFixed(2)})` : "null");
          // console.log("fish location", `(${fish.x.toFixed(2)}, ${fish.y.toFixed(2)})`);
          // console.log("fish dist:", bobber ? Math.sqrt((bobber.x - fish.x) ** 2 + (bobber.y - fish.y) ** 2).toFixed(2) : "N/A");
          
          const attractionRadius = 150;
          const hoverRadius = 80;
          const biteRadius = 10;
          const maxspeed = 1.3;
          const minSpeed = 0.2;
          const disthover = 70;

          let {
          x, y, vx, vy,
          behavior,
          tapCount,
          tapCooldown,
          requiredTaps,
          tapflag
          } = fish;

          let newVx = vx;
          let newVy = vy;
          let newBehavior = behavior;
          let tempID = fish.id;
          let newtapcount=tapCount;
          let newtapreq= requiredTaps;
          let Ntapflag= tapflag;
         

          let dx = 0;
          let dy = 0;
          let dist = 0;
            

          if (bobber) {
            dx = bobber.x - fish.x;
            dy = bobber.y - fish.y;
            dist = Math.sqrt(dx * dx + dy * dy);
          }
          if (!isFinite(dist) || dist < 1) dist = 1;

          //caught
          if (newBehavior === "caught") {
            return fish; // frozen
          }

          let win=false; //temp variable for winning the mini game, eventually replace with mobile logic


          if(newBehavior === "bite" && bobber) {
          let hook=1; //eventually replace with mobile logic

          if(hook===1){
            //pop up with bite screen and start mini game on phone
            //if win change flag to caught 
            win=true; //temp auto win for testing
            newBehavior="caught";
            return {
              ...fish,
              behavior: newBehavior,
              x: bobber.x,
              y: bobber.y,
              vx: 0,
              vy: 0,
            };}
            else{

            //reset fish to swimming if they escape
            }
        }

        let hook=0; //temp hook variable to simulate hook state, eventually replace with mobile logic 

        
        if(newBehavior === "hovering" && hook === 0 && bobber ) {

          let test=0;
          console.log("in hovering----------------------------------------");


          if (test===0){

            let hdx = fish.hX - fish.x;
            let hdy = fish.hY - fish.y;
            let hdist = Math.sqrt(hdx * hdx + hdy * hdy);


            if(newtapreq<= newtapcount){
              console.log("switch to bite----------------------------------------");
              return{
                ...fish,
                behavior: newBehavior,
                x,
                y,
                vx: 0,
                vy: 0,
                tapCount:newtapcount,
                tapflag:Ntapflag
              };
              //newBehavior="bite"
              
            }

            

            if(Ntapflag===1 &&(newtapreq> newtapcount)){
              console.log("flag is 1----------------------------------------");

              if(dist>=hoverRadius){
                console.log("flag switch to 0---------------------------------------");
                Ntapflag=0;
              }


              console.log("move away from bob dist:----------------------------------------",dist);
              newVx += (hdx / hdist)*0.01;
              newVy += (hdy / hdist)*0.01;





              return{
                  ...fish,
                  behavior: newBehavior,
                  x:fish.x+newVx,
                  y:fish.y + newVy,
                  vx: newVx,
                  vy: newVy,
                  tapCount:newtapcount,
                  tapflag: Ntapflag,
                  };


            }

            if(Ntapflag===0 &&(newtapreq> newtapcount)){

              console.log("flag is 0----------------------------------------");

            if(dx<= biteRadius && dy<=biteRadius){

              console.log("we biting----------------------------------------");


              Ntapflag=1
              newtapcount+=1;

              console.log("dist from bob STOP----------------------------------------");

              return{
                ...fish,
                behavior: newBehavior,
                x,
                y,
                vx: vx,
                vy: vy,
                tapCount:newtapcount,
                tapflag:Ntapflag
              };}
              else{
                
              console.log("go to bob dist=----------------------------------------",dist);
                newVx += (dx / dist)*0.001;
                newVy += (dy / dist)*0.001;
                return{
                  ...fish,
                  behavior: newBehavior,
                  x:fish.x+newVx,
                  y:fish.y + newVy,
                  vx: newVx,
                  vy: newVy,
                  tapCount:newtapcount,
                  tapflag:Ntapflag

                    };



              }
            }



          }

          if(test===1){
            
            

            if(dx<= biteRadius && dy<=biteRadius){

              console.log("dist from bob STOP----------------------------------------");

              return{
            ...fish,
            behavior: newBehavior,
            x,
            y,
            vx: 0,
            vy: 0,
              };}
              else{
                
              console.log("go to bob dist=----------------------------------------",dist);
                newVx += (dx / dist)*0.001;
                newVy += (dy / dist)*0.001;
                return{
                  ...fish,
                  behavior: newBehavior,
                  x:fish.x+newVx,
                  y:fish.y + newVy,
                  vx: newVx,
                  vy: newVy,
                    };



              }
            
          }

          if(test===2){
            if(dist<= biteRadius){


              console.log("move away from bob dist:----------------------------------------",dist);
              newVx += ((0-dx) / dist)*0.001;
              newVy += ((0-dy) / dist)*0.001;


              return{
                  ...fish,
                  behavior: newBehavior,
                  x:fish.x+newVx,
                  y:fish.y + newVy,
                  vx: newVx,
                  vy: newVy,
                    };




            }else{

              

                              console.log("STOOOOPy from bob dist:----------------------------------------",dist);



                return{
                  ...fish,
                  behavior: newBehavior,
                  x,
                  y,
                  vx: 0,
                  vy: 0,
                    };
                    

              
            }
            

            




           
          }



            
          
          // const seed = Number(fish.id.slice(0, 5));
          // const angle = time * 0.01 + seed;
      

          // const orbitX = Math.cos(angle) * hoverRadius; 
          // const orbitY = Math.sin(angle) * hoverRadius;

          // const pushX = -orbitX * 0.3; // push away from bobber to create tension
          // const pushY = -orbitY * 0.3;
          

          // const pullStrength = 0.5;

          // const pullX = dx * pullStrength;
          // const pullY = dy * pullStrength;

          // let newtapCount = tapCount;
          // let newTapCooldown = Math.max(0, tapCooldown - 1);


          // if(dist < biteRadius && tapCooldown <= 0) {
          //   console.log("in bite radius, tap count:", tapCount, "cooldown:", tapCooldown);
          //   console.log("target fish id:", targetFishId, "temp id:", tempID);

          //   newtapCount = tapCount + 1;
          //   newTapCooldown = 500; // 30 frames cooldown

          // }

          // if(tapCooldown > 250 && dist<(hoverRadius-20)) {// move away from bobber slightly during cooldown to give player a chance to tap again, eventually replace with mobile logic that gives player a chance to tap again
          //   console.log("moving away--------------------------------");
          //   newVx += (pushX / dist) * 0.5; 
          //   newVy += (pushY / dist) * 0.5;
          // }
          // if(tapCooldown < 100&&dist>(hoverRadius -30)) {
          //   console.log("move toward--------------------------");
          //   newVx += (pullX / dist) * 0.5; // move towards bobber when cooldown is almost up to simulate fish being pulled in  
          //   newVy += (pullY / dist) * 0.5;
          // }


          // if ( targetFishId && targetFishId===tempID &&newtapCount >= fish.requiredTaps)  {
          //   console.log("fish is going to bite, tap count:", newtapCount);
          //   //newBehavior = "bite";

          // }

          // return {
          //   ...fish,
          //   behavior: newBehavior,
          //   x: fish.x + newVx,
          //   y: fish.y + newVy,
          //   vx: newVx,
          //   vy: newVy,
          //   tapCount: newtapCount,
          //   tapCooldown: newTapCooldown,
          // };

          return fish;



          
         }
    

        if (newBehavior === "attracted") {
                   // console.log("attracted logic running");

            const HX= fish.x;
            const HY= fish.y;

             


          if(bobber && dist < hoverRadius) {
            newBehavior = "hovering";
            
          }

          if(!targetFishId){
            if(!hoverQueueRef.current.includes(fish.id) && hoverQueueRef.current.length <2){
              hoverQueueRef.current.push(fish.id)
              console.log("added fish to Q-----------------------------------");
            }
 
        }
        //turn quicker
          //const closeBoost = dist < 70 ? 2 : 1;

                    
          const speed = Math.max(
            minSpeed,
            Math.min(dist / attractionRadius, 1) * maxspeed
          );
          

          const targetVx = (dx / dist) * speed;
          const targetVy = (dy / dist) * speed;

          const turnSpeed = 0.15; // responsiveness
          const accel = 0.03;     // natural pull

          // steering (fast response)
          newVx += (targetVx - newVx) * turnSpeed;
          newVy += (targetVy - newVy) * turnSpeed;

          // acceleration (organic feel)
          newVx += (dx / dist) * accel ;
          newVy += (dy / dist) * accel;

          // wobble (personality)
          const seed = Number(fish.id.slice(0, 8)) || 0; // prevent NaN
          const wobbleStrength = 0.5;
          const wobbleSpeed = 0.1;

          // optional: reduce wobble when close to bobber
          const wobbleFactor = Math.max(dist / attractionRadius, 0.1);

          const wobbleX = Math.sin(time * wobbleSpeed + seed) * wobbleStrength * wobbleFactor;
          const wobbleY = Math.cos(time * wobbleSpeed + seed) * wobbleStrength * wobbleFactor;

          return {
            ...fish,
            behavior: newBehavior,
            x: fish.x + newVx + wobbleX,
            y: fish.y + newVy + wobbleY,
            vx: newVx,
            vy: newVy,
            hX: HX,
            hY : HY,

          };

        }

        if(newBehavior === "swimming") {

          //console.log("swimming logic running");
          //console.log("fish dist:", dist);


          if (bobber && dist < attractionRadius) {
            //console.log("entering attraction radius, behavior changing to attracted");
            const speed = Math.min(dist / attractionRadius, 1) * maxspeed;
            const targetVx = (dx / dist) * speed;
            const targetVy = (dy / dist) * speed;

            const turnSpeed = 0.2;   // responsiveness
            const accelBoost = 0.05; // extra pull

            newVx += (targetVx - newVx) * turnSpeed;
            newVy += (targetVy - newVy) * turnSpeed;

            // extra pull so it doesn’t feel too sluggish when far away
            newVx += (dx / dist) * accelBoost;
            newVy += (dy / dist) * accelBoost;
            //console.log("changing to attracted now");
            newBehavior = "attracted";
          }
          // 🐟 normal movement + wobble
            const speed = Math.sqrt(newVx * newVx + newVy * newVy);
            const maxSpeed = 1.5;

            if (speed > maxSpeed) {
              newVx = (newVx / speed) * maxSpeed;
              newVy = (newVy / speed) * maxSpeed;
            }

            const wobbleX = Math.sin(time + fish.y * 0.05) * 0.2;
            const wobbleY = Math.cos(time + fish.x * 0.06) * 0.2;

            if (Math.random() < 0.02) { // 2% chance per frame
              const angle = Math.random() * (Math.PI / 4);
              const direction = Math.random() < 0.5 ? -1 : 1;
              const theta = angle * direction;

              const rotatedVx = newVx * Math.cos(theta) - newVy * Math.sin(theta);
              const rotatedVy = newVx * Math.sin(theta) + newVy * Math.cos(theta);

              newVx = rotatedVx;
              newVy = rotatedVy;
            }

            return {
              ...fish,
              behavior: newBehavior,
              x: fish.x + newVx + wobbleX,
              y: fish.y + newVy + wobbleY,
              vx: newVx,
              vy: newVy,
            };

          }



            return fish;


          })
        .filter(fish =>
        fish.x > -100 &&
        fish.x < LakeWidth + 100 &&
        fish.y > -100 &&
        fish.y < LakeHeight + 100
          )
          
    ); 

    

      animationId = requestAnimationFrame(update);
    
    };

    animationId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationId);
  }, [bobber]);

  return { fishInLake, setFishInLake, targetFishId };
}