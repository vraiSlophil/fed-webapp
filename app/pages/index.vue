<script lang="ts" setup>
const mousePosition = ref<{ x: number, y: number }>({x: 0, y: 0});

// Obtenir les dimensions de l'écran
const screenCenter = ref<{ x: number, y: number }>({x: 0, y: 0});
const maxDistance = ref<{ x: number, y: number }>({x: 0, y: 0});

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

const handleMouseMove = (event: MouseEvent) => {
	mousePosition.value = {
		x: event.clientX,
		y: event.clientY
	};
};

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
});

// Calculer l'opacité en temps réel
const opacity = computed(() => calculateOpacity(mousePosition.value.x, mousePosition.value.y).toFixed(2));
</script>

<template>
<!--	<div class="fixed top-2 left-2 z-999999 p-2 bg-black/20 rounded backdrop-blur-xs">-->
<!--		<p class="text-white text-xs">-->
<!--			X: {{ mousePosition.x }}-->
<!--		</p>-->
<!--		<p class="text-white text-xs">-->
<!--			Y: {{ mousePosition.y }}-->
<!--		</p>-->
<!--		<p class="text-white text-xs">-->
<!--			oppacity: {{ opacity }}-->
<!--		</p>-->
<!--	</div>-->
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

	<section class="min-h-screen relative flex flex-col items-center justify-center overflow-x-hidden">
<!--			 @mousemove="handleMouseMove">-->
<!--		<div-->
<!--			:style="{-->
<!--				transform: `translate(${mousePosition.x}px, ${mousePosition.y}px) scale(${Math.min(1, Number(opacity) * 3)})`,-->
<!--				opacity: opacity-->

<!--			}"-->
<!--			class="w-100 h-100 absolute -top-50 -left-50 z-[-1] rounded-full bg-amber-500/20 blur-3xl transition-all duration-1500 ease-out"-->
<!--			style="pointer-events: none;"-->
<!--		></div>-->
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

	</section>

</template>

<style scoped>

</style>