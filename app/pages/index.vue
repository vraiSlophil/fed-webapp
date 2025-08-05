<script lang="ts" setup>
const mousePosition = ref<{ x: number, y: number }>({x: 0, y: 0});

// Obtenir les dimensions de l'écran
const windowHeight = ref<number>(0);
const screenCenter = ref<{ x: number, y: number }>({x: 0, y: 0});
const maxDistance = ref<{ x: number, y: number }>({x: 0, y: 0});
const scrollY = ref<number>(0);


const handleScroll = () => {
	scrollY.value = window.scrollY;

};

const handleMouseMove = (event: MouseEvent) => {
	mousePosition.value = {
		x: event.clientX,
		y: event.clientY + window.scrollY
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
	const progress = mousePosition.value.x / window.innerWidth;
	const verticalProgress = mousePosition.value.y / window.innerHeight;
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
	screenCenter.value = {
		x: window.innerWidth / 2,
		y: window.innerHeight / 2
	};

	maxDistance.value = {
		x: window.innerWidth / 2,
		y: window.innerHeight / 2
	};

	windowHeight.value = window.innerHeight;
	// Ajouter l'event listener sur window
	window.addEventListener('scroll', handleScroll);
});

// Ajouter onUnmounted pour nettoyer l'event listener
onUnmounted(() => {
	window.removeEventListener('scroll', handleScroll);
});

</script>

<template>
	<div>
<!--		<div class="fixed top-2 left-2 z-999999 p-2 bg-black/20 rounded backdrop-blur-xs">-->
<!--			<p class="text-white text-xs">-->
<!--				X: {{ mousePosition.x }}-->
<!--			</p>-->
<!--			<p class="text-white text-xs">-->
<!--				Y: {{ mousePosition.y }}-->
<!--			</p>-->
<!--			<p class="text-white text-xs">-->
<!--				oppacity: {{ opacity }}-->
<!--			</p>-->
<!--			<p class="text-white text-xs">-->
<!--				animatedPath: {{ animatedPath }}-->
<!--			</p>-->
<!--		</div>-->
		<div>
			<!--	## 🏗️ **Structure recommandée de la Landing Page**-->

			<!--	### **1. Hero Section (Above the fold)**-->
			<!--	```vue-->
			<!--	<template>-->
			<!--		<section class="hero-section">-->
			<!--			&lt;!&ndash; Animated background (particles/gradient) &ndash;&gt;-->
			<!--			&lt;!&ndash; Main headline avec animation typewriter &ndash;&gt;-->
			<!--			&lt;!&ndash; Sous-titre avec fade-in décalé &ndash;&gt;-->
			<!--			&lt;!&ndash; CTA principal (Connexion/Inscription) &ndash;&gt;-->
			<!--			&lt;!&ndash; Mockup de l'app avec parallax &ndash;&gt;-->
			<!--		</section>-->
			<!--	</template>-->
			<!--	```-->

			<!--	### **2. Features Section (Défilement)**-->
			<!--	```vue-->
			<!--	&lt;!&ndash; Animations au scroll avec Intersection Observer &ndash;&gt;-->
			<!--	<section class="features-section">-->
			<!--		&lt;!&ndash; 3-4 features avec icônes animées &ndash;&gt;-->
			<!--		&lt;!&ndash; Animations staggered (décalées) &ndash;&gt;-->
			<!--		&lt;!&ndash; Micro-interactions sur hover &ndash;&gt;-->
			<!--	</section>-->
			<!--	```-->

			<!--	### **3. Demo/Preview Section**-->
			<!--	```vue-->
			<!--	<section class="demo-section">-->
			<!--		&lt;!&ndash; Carrousel de screenshots &ndash;&gt;-->
			<!--		&lt;!&ndash; Ou vidéo avec play button animé &ndash;&gt;-->
			<!--		&lt;!&ndash; Ou démo interactive &ndash;&gt;-->
			<!--	</section>-->
			<!--	```-->

			<!--	### **4. Social Proof (optionnel)**-->
			<!--	```vue-->
			<!--	<section class="testimonials">-->
			<!--		&lt;!&ndash; Témoignages avec animations &ndash;&gt;-->
			<!--		&lt;!&ndash; Statistiques avec compteurs animés &ndash;&gt;-->
			<!--	</section>-->
			<!--	```-->

			<!--	### **5. Final CTA**-->
			<!--	```vue-->
			<!--	<section class="cta-section">-->
			<!--		&lt;!&ndash; Rappel de la value proposition &ndash;&gt;-->
			<!--		&lt;!&ndash; Bouton CTA secondaire &ndash;&gt;-->
			<!--	</section>-->
			<!--	```-->

			<!--	-&#45;&#45;-->

			<!--	## 🛠️ **Stack technique recommandée**-->

			<!--	### **Core :**-->
			<!--	- **Nuxt 3** (SSR/SSG pour le SEO)-->
			<!--	- **PrimeVue** (composants UI)-->
			<!--	- **PrimeFlex** (utilitaires CSS)-->

			<!--	### **Animations :**-->
			<!--	- **@vueuse/motion** (animations Vue natives)-->
			<!--	- **GSAP** (animations complexes et performances)-->
			<!--	- **Lottie** (animations vectorielles)-->

			<!--	### **Effets visuels :**-->
			<!--	- **Three.js** (backgrounds 3D/particles)-->
			<!--	- **Canvas Confetti** (effets de célébration)-->
			<!--	- **Intersection Observer API** (animations au scroll)-->

			<!--	-&#45;&#45;-->

			<!--	## 🎨 **Concepts d'animations impressionnantes**-->

			<!--	### **Hero Section :**-->
			<!--	- **Background** : Particules flottantes ou gradient animé-->
			<!--	- **Texte** : Animation typewriter + glitch effect-->
			<!--	- **Mockup** : Parallax 3D avec rotation subtle-->
			<!--	- **CTA** : Hover avec glow effect + pulse-->

			<!--	### **Features :**-->
			<!--	- **Reveal** : Slide-in depuis différentes directions-->
			<!--	- **Icons** : Micro-animations en boucle-->
			<!--	- **Cards** : Tilt effect au hover + shadow animée-->

			<!--	### **Scroll Effects :**-->
			<!--	- **Parallax** : Différentes vitesses de défilement-->
			<!--	- **Morphing** : Formes qui se transforment-->
			<!--	- **Counter** : Chiffres qui s'incrémentent-->

			<!--	-&#45;&#45;-->

			<!--	## 📱 **Structure de fichiers Nuxt**-->

			<!--	```-->
			<!--	pages/-->
			<!--	├── index.vue (Landing page)-->
			<!--	├── auth/-->
			<!--	│   ├── login.vue-->
			<!--	│   └── signup.vue-->
			<!--	└── playground/-->
			<!--	└── index.vue-->

			<!--	components/-->
			<!--	├── landing/-->
			<!--	│   ├── HeroSection.vue-->
			<!--	│   ├── FeaturesSection.vue-->
			<!--	│   ├── DemoSection.vue-->
			<!--	│   └── CtaSection.vue-->
			<!--	├── ui/-->
			<!--	│   ├── AnimatedButton.vue-->
			<!--	│   ├── ParticleBackground.vue-->
			<!--	│   └── ScrollReveal.vue-->

			<!--	composables/-->
			<!--	├── useAnimations.js-->
			<!--	├── useScrollTrigger.js-->
			<!--	└── useParticles.js-->
			<!--	```-->

			<!--	-&#45;&#45;-->

			<!--	## 🎯 **Exemples d'idées créatives**-->

			<!--	### **Hero innovant :**-->
			<!--	- Mockup de l'app qui "sort" de l'écran en 3D-->
			<!--	- Texte qui se "construit" lettre par lettre-->
			<!--	- Background avec particles qui réagissent au curseur-->

			<!--	### **Features dynamiques :**-->
			<!--	- Cards qui se "retournent" pour révéler le contenu-->
			<!--	- Icons qui s'animent en continu-->
			<!--	- Timeline verticale avec progression animée-->

			<!--	### **Interactions surprenantes :**-->
			<!--	- Cursor personalisation (traînée, formes)-->
			<!--	- Sound effects sur les interactions-->
			<!--	- Easter eggs cachés-->

			<!--	-&#45;&#45;-->

			<!--	## 🚀 **Plan d'implémentation**-->

			<!--	### **Phase 1 : Structure**-->
			<!--	1. Setup Nuxt + PrimeVue-->
			<!--	2. Créer les composants de base-->
			<!--	3. Mise en page responsive-->

			<!--	### **Phase 2 : Animations de base**-->
			<!--	1. Intégrer @vueuse/motion-->
			<!--	2. Animations d'entrée simples-->
			<!--	3. Scroll triggers-->

			<!--	### **Phase 3 : Effets avancés**-->
			<!--	1. Ajouter GSAP pour les animations complexes-->
			<!--	2. Background interactif (particles/3D)-->
			<!--	3. Micro-interactions-->

			<!--	### **Phase 4 : Polish**-->
			<!--	1. Optimisation des performances-->
			<!--	2. Tests sur différents devices-->
			<!--	3. Ajustements finaux-->
		</div>

<!--		show navbar if scroll is > view height-->
		<Navbar
			class="transition-all duration-200 ease-out"
			:class="scrollY > windowHeight ? 'opacity-100 pointer-events-auto ' : '!opacity-0 !pointer-events-none'"
		/>

		<section class="min-h-screen relative flex flex-col items-center justify-center overflow-visible"
				 @mousemove="handleMouseMove">

			<!--	### **1. Hero Section (Above the fold)**-->
			<!--	```vue-->
			<!--	<template>-->
			<!--		<section class="hero-section">-->
			<!--			&lt;!&ndash; Animated background (particles/gradient) &ndash;&gt;-->
			<!--			&lt;!&ndash; Main headline avec animation typewriter &ndash;&gt;-->
			<!--			&lt;!&ndash; Sous-titre avec fade-in décalé &ndash;&gt;-->
			<!--			&lt;!&ndash; CTA principal (Connexion/Inscription) &ndash;&gt;-->
			<!--			&lt;!&ndash; Mockup de l'app avec parallax &ndash;&gt;-->
			<!--		</section>-->
			<!--	</template>-->
			<!--	```-->

<!--			<div-->
<!--				:style="{-->
<!--							transform: `translate(${mousePosition.x}px, ${mousePosition.y}px) scale(${Math.min(1, Number(opacity) * 3)})`,-->
<!--							opacity: opacity-->
<!--						}"-->
<!--				class="w-100 h-100 absolute -top-50 -left-50 z-[-1] rounded-full bg-amber-900 blur-3xl transition-all duration-1500 ease-out"-->
<!--				style="pointer-events: none;"-->
<!--			></div>-->

			<h1
				class="!text-7xl font-mono"
			>
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
				<span>votre travail.</span>
			</h1>

			<div class="absolute inset-0 overflow-visible pointer-events-none">
				<!--			inverted way svg -->
				<svg
					class="absolute top-0 right-0 w-full h-auto z-[-1] fill-amber-900 transform rotate-180 blur-3xl"
					height="300"
					viewBox="0 0 285.74999 79.375"
					width="1080"
					xmlns="http://www.w3.org/2000/svg">
					<path
						:d="animatedPath"
						class="stroke-0"/>
				</svg>

				<!--			normal way svg-->
				<svg
					class="absolute bottom-0 left-0 w-full h-auto z-[-1] fill-amber-900 blur-3xl"
					height="300"
					viewBox="0 0 285.74999 79.375"
					width="1080"
					xmlns="http://www.w3.org/2000/svg">
					<path
						:d="animatedPath"
						class="stroke-0"/>
				</svg>
				<svg
					class="absolute bottom-0 right-0 w-full h-auto z-[-1] fill-amber-900 transform translate-y-8/10 rotate-180 blur-3xl"
					height="300"
					viewBox="0 0 285.74999 79.375"
					width="1080"
					xmlns="http://www.w3.org/2000/svg">
					<path
						:d="animatedPath"
						class="stroke-0"/>
				</svg>
			</div>
		</section>
		<section class="min-h-screen relative flex flex-col items-center justify-center overflow-x-hidden">
			<!--	### **2. Features Section (Défilement)**-->
			<!--	```vue-->
			<!--	&lt;!&ndash; Animations au scroll avec Intersection Observer &ndash;&gt;-->
			<!--	<section class="features-section">-->
			<!--		&lt;!&ndash; 3-4 features avec icônes animées &ndash;&gt;-->
			<!--		&lt;!&ndash; Animations staggered (décalées) &ndash;&gt;-->
			<!--		&lt;!&ndash; Micro-interactions sur hover &ndash;&gt;-->
			<!--	</section>-->
			<!--	```-->
		</section>
		<section class="min-h-screen relative flex flex-col items-center justify-center overflow-x-hidden">
			<!--	### **3. Demo/Preview Section**-->
			<!--	```vue-->
			<!--	<section class="demo-section">-->
			<!--		&lt;!&ndash; Carrousel de screenshots &ndash;&gt;-->
			<!--		&lt;!&ndash; Ou vidéo avec play button animé &ndash;&gt;-->
			<!--		&lt;!&ndash; Ou démo interactive &ndash;&gt;-->
			<!--	</section>-->
			<!--	```-->
		</section>
		<section class="min-h-screen relative flex flex-col items-center justify-center overflow-x-hidden">
			<!--	### **4. Social Proof (optionnel)**-->
			<!--	```vue-->
			<!--	<section class="testimonials">-->
			<!--		&lt;!&ndash; Témoignages avec animations &ndash;&gt;-->
			<!--		&lt;!&ndash; Statistiques avec compteurs animés &ndash;&gt;-->
			<!--	</section>-->
			<!--	```-->
		</section>
		<section class="min-h-screen relative flex flex-col items-center justify-center overflow-x-hidden">
			<!--	### **5. Final CTA**-->
			<!--	```vue-->
			<!--	<section class="cta-section">-->
			<!--		&lt;!&ndash; Rappel de la value proposition &ndash;&gt;-->
			<!--		&lt;!&ndash; Bouton CTA secondaire &ndash;&gt;-->
			<!--	</section>-->
			<!--	```-->
		</section>
	</div>
</template>

<style scoped>

</style>