import { WheatField } from "@/widgets/scene/ui/SceneField";
import type { Season } from "@/widgets/scene/lib/season";
import {
	APPLE_TREE,
	BACK_RIDGE,
	BIRCH_TREE,
	CHERRY_TREE,
	FRONT_RIDGE,
	LOWER_BUSH,
	LOWER_PINES,
	MID_RIDGE,
	OAK_TREE,
	ROWAN_TREE,
	STUMP,
	UPPER_BUSH,
	onBackMeadow,
	onBackRidge,
} from "@/widgets/scene/lib/landscape";
import { StorkTree } from "@/widgets/scene/ui/SceneStorks";
import { Village } from "@/widgets/scene/ui/SceneVillage";
import { BACK_LITTER, FRONT_LITTER, MID_LITTER } from "@/widgets/scene/ui/flora/litter";
import { MeadowLitter } from "@/widgets/scene/ui/flora/MeadowLitter";
import { Pine } from "@/widgets/scene/ui/flora/Pine";
import { Tree } from "@/widgets/scene/ui/flora/Tree";
import type { ReactNode } from "react";

const hill = (ridge: string) => `${ridge} L1600,900 L0,900 Z`;
interface MeadowProps {
	season: Season;
}

/* the big light meadow above the river, with the upper row of trees */
export function BackMeadow({ season }: MeadowProps) {
	return (
		<>
			<path className='hill hill-back' d={hill(BACK_RIDGE)} fill='#9fd8a0' />
			<MeadowLitter {...BACK_LITTER} />
			{[150, 600, 1060, 1390].map((x) => (
				<Pine key={x} x={x} base={onBackRidge(x)} scale={0.45} color='#7fc084' />
			))}
			<Pine x={264} base={529} scale={0.8} color='#5aa473' />
			<Pine x={684} base={581} scale={0.9} color='#5aa473' />
			<Pine x={864} base={525} scale={0.8} color='#5aa473' />
			<Tree kind='apple' {...APPLE_TREE} tone='far' season={season} seed={101} />
			<Tree kind='birch' {...BIRCH_TREE} tone='far' season={season} seed={202} />
			{/* the household's plot, up at the top of the slope and left of the хати */}
			<WheatField season={season} />
			<Village />
			{/* the dead tree between the хати, with its nest */}
			<StorkTree season={season} />
			{/* nearer than the хата, so it stands in front of it — and in winter it is
			    the one the household dresses up */}
			<Pine x={1232} base={566} scale={0.85} color='#5aa473' festive />
			<Tree kind='maple' x={1525} base={onBackMeadow(1525)} scale={0.9} tone='far' season={season} seed={303} />
		</>
	);
}

/* drawn after the upper critters, so the hare and the hedgehog can hide in it */
export function UpperBush({ season }: MeadowProps) {
	return <Tree kind='bush' {...UPPER_BUSH} tone='far' season={season} seed={707} />;
}

export function MidMeadow() {
	return (
		<>
			<path className='hill hill-mid' d={hill(MID_RIDGE)} fill='#74c08a' />
			<MeadowLitter {...MID_LITTER} />
		</>
	);
}

interface FrontMeadowProps extends MeadowProps {
	/* whatever walks the meadow behind its trees */
	behindTrees?: ReactNode;
}

/* the meadow below the river, with the lower row of trees */
export function FrontMeadow({ season, behindTrees }: FrontMeadowProps) {
	return (
		<>
			<path className='hill hill-front' d={hill(FRONT_RIDGE)} fill='#4f9e6e' />
			<MeadowLitter {...FRONT_LITTER} />
			{behindTrees}
			{LOWER_PINES.map((pine) => (
				<Pine key={pine.x} {...pine} color='#3d8459' />
			))}
			{/* a weathered stump, rings and all */}
			<g transform={`translate(${STUMP.x} ${STUMP.base}) scale(${STUMP.scale})`}>
				<path
					d='M-9.5,0 C-10.5,-6 -10,-12 -9,-14.6 L9,-14.6 C10,-12 10.5,-6 9.5,0 C4,1.6 -4,1.6 -9.5,0 Z'
					fill='#7a5a3c'
				/>
				<path
					d='M-9,-14.6 C-9.6,-11 -9.2,-5 -8.4,-0.6 C-6.6,0 -4.6,0.4 -2.6,0.6 C-3.6,-4.4 -4,-9.6 -3.6,-14.6 Z'
					fill='#6a4c31'
				/>
				<ellipse cx={0} cy={-14.8} rx={9.2} ry={3.4} fill='#c4a271' />
				<ellipse cx={0} cy={-14.8} rx={6} ry={2.2} fill='none' stroke='#a8875a' strokeWidth={0.7} />
				<ellipse cx={0} cy={-14.8} rx={3} ry={1.1} fill='none' stroke='#a8875a' strokeWidth={0.6} />
				<path d='M-11.6,0.4 C-10.4,-2.4 -9.8,-3.6 -9.4,-4.6 C-8.6,-2.6 -8.4,-1 -8.6,0.6 Z' fill='#6a4c31' />
				<path d='M11.6,0.6 C10.4,-2 9.8,-3.4 9.4,-4.4 C8.6,-2.4 8.4,-0.8 8.6,0.8 Z' fill='#6a4c31' />
			</g>
			<Tree kind='bush' {...LOWER_BUSH} tone='near' season={season} seed={808} />
			<Tree kind='cherry' {...CHERRY_TREE} tone='near' season={season} seed={404} />
			<Tree kind='oak' {...OAK_TREE} tone='near' season={season} seed={505} />
			<Tree kind='rowan' {...ROWAN_TREE} tone='near' season={season} seed={606} />
		</>
	);
}
