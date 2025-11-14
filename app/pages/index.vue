<script lang="ts" setup>
import Navbar from "~/domains/shared/components/Navbar.vue";
import TypewriterText from "~/domains/shared/components/TypewriterText.vue";

const mousePosition = ref<{ x: number, y: number }>({x: 0, y: 0});

// Obtenir les dimensions de l'écran
const windowHeight = ref<number>(0);
const windowWidth = ref<number>(0);
const screenCenter = ref<{ x: number, y: number }>({x: 0, y: 0});
const maxDistance = ref<{ x: number, y: number }>({x: 0, y: 0});
const scrollY = ref<number>(0);
const isMobile = ref(false);

const handleScroll = () => {
	scrollY.value = window.scrollY;
};

const handleMouseMove = (event: MouseEvent) => {
	mousePosition.value = {
		x: event.clientX,
		y: event.clientY
	};
};

// Calculer l'opacité basée sur la distance du centre
const calculateOpacity = (x: number, y: number): number => {
	// Distance normalisée du centre (0 = centre, 1 = bord)
	const normalizedDistanceX = (x - screenCenter.value.x) / maxDistance.value.x;
	const normalizedDistanceY = (y - screenCenter.value.y) / maxDistance.value.y;

	// Distance euclidienne normalisée
	const distance = Math.sqrt(normalizedDistanceX * normalizedDistanceX + normalizedDistanceY * normalizedDistanceY);

	// Opacité inversée (1 au centre, 0 aux bords) avec une valeur minimum
	return Math.max(0, Math.min(1, 1 - distance));
};

const animatedPath = computed(() => {
	if (!windowWidth.value) return '';

	const progress = mousePosition.value.x / windowWidth.value;
	const verticalProgress = mousePosition.value.y / windowHeight.value;
	const time = Date.now() * 0.01; // Temps très lent pour mouvement organique

	const wave1 = Math.sin(progress * Math.PI + time) * 4;
	const wave2 = Math.cos(progress * Math.PI * 1.2 + time * 0.7) * 3;
	const wave3 = Math.sin(progress * Math.PI * 0.8 + time * 1.3) * 2;
	const wave4 = Math.cos(verticalProgress * Math.PI * 2) * 5;

	return `M ${240.39618 + wave1 * 0.3},${29.665889 + wave2 * 0.8}
	   C ${204.25152 + wave2 * 0.6},${73.994246 + wave1 * 0.4}
	   ${157.45299 + wave3 * 0.5},${51.075112 + wave4 * 0.7}
	   ${139.69607 + wave1 * 0.4},${44.32856 + wave2 * 0.5}
	   ${121.93915 + wave4 * 0.3},${37.582008 + wave3 * 0.6}
	   ${70.740531 + wave2 * 0.5},${19.950529 + wave1 * 0.4}
	   ${25.57415 + wave3 * 0.2},${32.052824 + wave4 * 0.3}
	   ${13.88881 + wave1 * 0.1},${35.183901 + wave2 * 0.2}
	   ${5.7159848 + wave4 * 0.1},${37.18589 + wave3 * 0.1}
	   0,${39.191923 + wave1 * 0.1}
	   V 79.375 H 285.75
	   V ${8.4754517 + wave2 * 0.3}
	   C ${267.88916 + wave3 * 0.4},${0.033584 + wave4 * 0.2}
	   ${249.17767 + wave1 * 0.2},${18.896134 + wave2 * 0.4}
	   ${240.39618 + wave1 * 0.3},${29.665889 + wave2 * 0.8} Z`;
});

// Calculer l'opacité en temps réel
const opacity = computed(() => calculateOpacity(mousePosition.value.x, mousePosition.value.y).toFixed(2));

// Initialiser les valeurs au montage du composant
onMounted(() => {
	// Initialiser les dimensions
	windowHeight.value = window.innerHeight;
	windowWidth.value = window.innerWidth;

	screenCenter.value = {
		x: window.innerWidth / 2,
		y: window.innerHeight / 2
	};

	maxDistance.value = {
		x: window.innerWidth / 2,
		y: window.innerHeight / 2
	};

	// Vérifier si mobile
	const updateMobile = () => {
		isMobile.value = window.innerWidth < 768;
	};
	updateMobile();

	// Gestionnaires d'événements
	window.addEventListener('scroll', handleScroll);
	window.addEventListener('resize', () => {
		windowHeight.value = window.innerHeight;
		windowWidth.value = window.innerWidth;
		screenCenter.value = {
			x: window.innerWidth / 2,
			y: window.innerHeight / 2
		};
		maxDistance.value = {
			x: window.innerWidth / 2,
			y: window.innerHeight / 2
		};
		updateMobile();
	});
});

// Nettoyer les event listeners
onUnmounted(() => {
	window.removeEventListener('scroll', handleScroll);
});
</script>

<template>
	<div>
		<Navbar
			:class="scrollY > windowHeight ? 'opacity-100 pointer-events-auto' : '!opacity-0 !pointer-events-none'"
			class="transition-all duration-200 ease-out"
		/>

		<section
			class="min-h-screen relative flex flex-col items-center justify-center overflow-visible"
			@mousemove="handleMouseMove"
		>
			<h1 class="!text-7xl font-mono">
				<span>Avec FED, </span>
				<TypewriterText
					:cursor-symbol="'_'"
					:phrases="
						// ['créez', 'planifiez', 'partagez' ]
						['planifiez', 'partagez' ]
					"
					:type-speed="80"
					class="font-bold font-mono"
				/>
				<span> votre travail.</span>
			</h1>

			<div class="absolute inset-0 overflow-visible pointer-events-none">
				<svg
					class="absolute inset-0 w-full h-full"
					viewBox="0 0 500 500"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						:d="animatedPath"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
					/>
				</svg>
			</div>
		</section>

		<section class="min-h-screen relative flex flex-col items-center justify-center overflow-x-hidden">
			<!-- Features Section -->
		</section>

		<section class="min-h-screen relative flex flex-col items-center justify-center overflow-x-hidden">
			<!-- Demo/Preview Section -->
		</section>

		<section class="min-h-screen relative flex flex-col items-center justify-center overflow-x-hidden">
			<!-- Social Proof -->
		</section>

		<section class="min-h-screen relative flex flex-col items-center justify-center overflow-x-hidden">
			<!-- Final CTA -->
		</section>
	</div>
</template>

<style scoped>
</style>