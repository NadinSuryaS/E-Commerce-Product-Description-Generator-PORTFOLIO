// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});



async function fetchProductImage(productName, keyFeatures) {
    const apiKey = 'sk-BJzWMVvdkHk1JihAgWrKc82di8il3nR8VOV172bInT8V10VG';
    const prompt = `${productName}, ${keyFeatures.join(', ')}, professional e-commerce product photo, high quality, detailed`;
    try {
        const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text_prompts: [{ text: prompt }],
                cfg_scale: 7,
                height: 1024,
                width: 1024,
                samples: 1,
                steps: 30
            })
        });
        const data = await response.json();
        if (data.artifacts && data.artifacts.length > 0) {
            const base64Image = `data:image/png;base64,${data.artifacts[0].base64}`;
            return base64Image;
        }
    } catch (error) {
        console.error('Error generating image from Stability AI:', error);
    }
    // Fallback to Unsplash source
    const query = encodeURIComponent(`${productName} product`);
    return `https://source.unsplash.com/300x300/?${query}`;
}

// AI Description Generation Demo
document.getElementById('description-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const productName = document.getElementById('product-name').value.trim();
    const keyFeaturesInput = document.getElementById('key-features').value.trim();
    const keyFeatures = keyFeaturesInput.split(',').map(f => f.trim()).filter(f => f);
    const targetAudience = document.getElementById('target-audience').value.trim();
    const tone = document.getElementById('tone').value;

    // Validation
    if (!productName || !keyFeaturesInput || !targetAudience) {
        alert('Please fill in all fields.');
        return;
    }

    const generatedDescription = generateDescription(productName, keyFeatures, targetAudience, tone);

    document.getElementById('description-text').textContent = generatedDescription;
    document.getElementById('generated-description').style.display = 'block';

    // Load AI-generated product image using Stability AI
    const productImage = document.getElementById('product-image');
    const imageSrc = await fetchProductImage(productName, keyFeatures);
    productImage.src = imageSrc;
    document.querySelector('.image-column').style.display = 'block';

    // Scroll to result
    document.getElementById('generated-description').scrollIntoView({
        behavior: 'smooth',
        block: 'center'
    });

    // Loading animation for button
    const button = document.querySelector('.generate-btn');
    const originalText = button.textContent;
    button.innerHTML = '<span class="spinner"></span>Generating...';
    button.disabled = true;
    setTimeout(() => {
        button.innerHTML = originalText;
        button.disabled = false;
     }, 1500);
});

// Copy to clipboard functionality
document.getElementById('copy-btn').addEventListener('click', function() {
    const descriptionText = document.getElementById('description-text').textContent;
    navigator.clipboard.writeText(descriptionText).then(function() {
        const copyBtn = document.getElementById('copy-btn');
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        copyBtn.style.backgroundColor = '#219a52';
        setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.style.backgroundColor = '#27ae60';
        }, 2000);
    });
});

function generateDescription(productName, features, audience, tone) {
    const toneStyles = {
        professional: {
            introStarters: ['Discover the excellence of', 'Elevate your experience with', 'Unlock superior performance using'],
            featureVerbs: ['equipped with', 'features', 'includes', 'boasts', 'delivers'],
            benefitPhrases: ['for enhanced efficiency', 'ensuring reliability', 'delivering optimal results', 'boosting productivity', 'streamlining operations'],
            cta: ['Choose quality that lasts.', 'Invest in performance today.', 'Experience the difference now.']
        },
        casual: {
            introStarters: ['Check out this awesome', 'Get ready for the cool', 'Meet your new favorite'],
            featureVerbs: ['comes with', 'has', 'rocks', 'packs', 'offers'],
            benefitPhrases: ['super easy to use', 'keeps things simple', 'makes life better', 'saves you time', 'adds fun'],
            cta: ['Grab one and see!', 'Add to cart now!', 'You won\'t regret it!']
        },
        enthusiastic: {
            introStarters: ['Ignite your passion with the incredible', 'Revolutionize your routine using this amazing', 'Get excited about the dynamic'],
            featureVerbs: ['boasts', 'delivers', 'powers', 'fuels', 'ignites'],
            benefitPhrases: ['exploding with energy', 'transforming your day', 'supercharging your lifestyle', 'sparking joy', 'elevating every moment'],
            cta: ['Don\'t wait—seize the thrill today!', 'Jump in and feel the excitement!', 'Make it yours right now!']
        },
        luxurious: {
            introStarters: ['Indulge in the sophistication of', 'Embrace unparalleled elegance with', 'Savor the luxury of'],
            featureVerbs: ['adorned by', 'crafted with', 'enhanced through', 'infused with', 'elevated by'],
            benefitPhrases: ['for exquisite refinement', 'offering timeless prestige', 'inspired by opulence', 'exuding sophistication', 'delivering pure indulgence'],
            cta: ['Elevate your world—acquire it today.', 'Claim your piece of luxury.', 'Indulge without hesitation.']
        }
    };

    const style = toneStyles[tone] || toneStyles.professional;

    // Capitalize product name for audience sentence
    const capitalizedProductName = productName.charAt(0).toUpperCase() + productName.slice(1).toLowerCase();

    // Catchy intro
    let description = style.introStarters[Math.floor(Math.random() * style.introStarters.length)] + ` ${productName}! `;

    // Features with benefits (avoid repetition by shuffling or cycling)
    if (features.length > 0) {
        // Shuffle verbs and benefits to avoid repetition
        const shuffledVerbs = [...style.featureVerbs].sort(() => Math.random() - 0.5);
        const shuffledBenefits = [...style.benefitPhrases].sort(() => Math.random() - 0.5);

        let featureList = '';
        features.forEach((feature, index) => {
            const verb = shuffledVerbs[index % shuffledVerbs.length];
            const benefit = shuffledBenefits[index % shuffledBenefits.length];
            featureList += `${verb} ${feature}${benefit}. `;
        });
        description += featureList;
    }

    // Tailored to audience
    description += `Perfect for ${audience}, this ${capitalizedProductName} brings unmatched value and convenience to your daily adventures. `;

    // CTA or impact statement
    description += style.cta[Math.floor(Math.random() * style.cta.length)];

    return description.trim();
}

// Add some animation on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all sections for animation
document.querySelectorAll('section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(20px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(section);
});

// Modal functionality for Projects
const modal = document.getElementById('project-modal');
const closeBtn = document.querySelector('.close');

// Product data
const productData = {
    phone: {
        beforeTitle: 'Basic listing: Smartphone with camera and battery.',
        afterDescription: 'Experience stunning clarity with our latest smartphone featuring an ultra HD camera, fast processor, and all-day battery — designed to keep you connected and inspired.'
    },
    laptop: {
        beforeTitle: 'Basic listing: Laptop with screen and keyboard.',
        afterDescription: 'Unleash productivity with our premium laptop, boasting a vibrant display, ergonomic keyboard, and powerful processor for seamless multitasking and creative workflows.'
    },
    smartwatch: {
        beforeTitle: 'Basic listing: Smart Watch with fitness features.',
        afterDescription: 'Transform your wellness with our intelligent smartwatch, offering heart rate monitoring, GPS tracking, and a vibrant display for active lifestyles and precise fitness goals.'
    }
};

// Open modal on button click
document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const product = btn.closest('.project-card').getAttribute('data-product');
        const data = productData[product];
        if (data) {
            document.getElementById('before-title').textContent = data.beforeTitle;
            document.getElementById('after-description').innerHTML = data.afterDescription;
            modal.style.display = 'block';
        }
    });
});

// Close modal
closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

// Close on outside click
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});
