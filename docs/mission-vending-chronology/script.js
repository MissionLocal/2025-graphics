document.addEventListener('DOMContentLoaded', () => {
    // Image background URLs - the only data we need to keep here
    const backgroundImages = [
        "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2022/04/24thStreetBART.jpg", // 01
        "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2022/07/My-project-3-4-e1658345342468.png", // 02
        "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2022/07/5p.m.24th.jpg", // 03
        "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2022/09/IMG_0162-800x600-1.jpg", // 04
        "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2022/08/IMG_0165.jpg", // 05
        "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2022/07/5p.m.24th.jpg", // 06
        "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2022/09/My-project.jpg", // 07
        "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2022/09/BARTPlaza.jpg", // 08
        "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2022/12/24thBARTPlazaNW.jpg", // 09
        "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2025/02/Screenshot-2025-02-24-at-12.29.58 PM.png", // 10
        "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2023/06/IMG_8701.jpg", // 11
        "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2023/09/16th-bart-plaza-barricades-vendor-scaled.jpg", // 12
        "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2023/10/vendorBanner.png", // 13
        "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2023/11/IMG_1698-scaled.jpg ", // 14
        "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2023/11/enforcement-scaled-e1701129804794.jpg", // 15
        "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2023/11/Franco-Gonzalez-70-2-14-p.m.-11-29.jpeg", // 16
        "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2024/02/IMG_2141-scaled.jpg ", // 17
        "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2024/06/vending-2.jpg", // 18
        "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2024/05/La-Placita-3-scaled-e1715357230372.jpg ", // 19
        "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2024/06/Pilot-2-scaled-e1719017954226.jpg", // 20
        "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2024/06/IMG_8370-1.jpeg", // 21
        "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2024/12/vending-ban-3-scaled.jpg", // 22
        "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2025/02/Screenshot-2025-02-24-at-12.52.04 PM.png ", // 23
        "https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2025/02/Screenshot-2025-02-24-at-12.52.40 PM.png", // 24
    ];

    // Elements
    const progressBar = document.getElementById('progress-bar');
    const sections = document.querySelectorAll('.scrolly-section');
    const contentCards = document.querySelectorAll('.content-card');
    const bgImages = document.querySelectorAll('.bg-image');
    
    // Set background images from our array
    bgImages.forEach((bg, index) => {
        if (index < backgroundImages.length) {
            bg.style.backgroundImage = `url('${backgroundImages[index]}')`;
        }
    });

    // Store the last progress value for smoother transitions
    let lastProgress = 0;
    
    // Function to check which section is in view
    function checkScroll() {
        // Calculate how far down the page the user has scrolled
        const scrollPosition = window.scrollY;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        
        // Calculate progress based on how many sections we've passed
        // This approach ensures we reach 100% at the last section
        const totalSections = sections.length;
        let activeIndex = 0;
        
        // Find the furthest section that's currently visible
        sections.forEach((section, index) => {
            const rect = section.getBoundingClientRect();
            if (rect.top < windowHeight * 0.7) {
                activeIndex = Math.max(activeIndex, index);
            }
        });
        
        // Calculate raw percentage based on current section and scroll within that section
        const currentSection = sections[activeIndex];
        const sectionTop = currentSection.offsetTop;
        const sectionHeight = currentSection.offsetHeight;
        const scrollWithinSection = Math.max(0, Math.min(1, (scrollPosition - sectionTop) / sectionHeight));
        
        // Overall progress combines which section we're in and how far we've scrolled within it
        const sectionProgress = (activeIndex + scrollWithinSection) / totalSections;
        const rawScrollPercentage = sectionProgress * 100;
        
        // Apply smoothing by blending with the previous value
        const smoothingFactor = 0.15;
        const smoothedProgress = lastProgress + smoothingFactor * (rawScrollPercentage - lastProgress);
        lastProgress = smoothedProgress;
        
        // Ensure we reach exactly 100% at the very bottom of the page
        const isAtBottom = scrollPosition + windowHeight >= documentHeight - 10;
        const finalProgress = isAtBottom ? 100 : smoothedProgress;
        
        progressBar.style.width = `${finalProgress}%`;
        
        // Determine which section is in view
        sections.forEach((section, index) => {
            const rect = section.getBoundingClientRect();
            // If the section is in the viewport (with a buffer)
            if (rect.top < windowHeight * 0.6 && rect.bottom > windowHeight * 0.4) {
                // Make the matching background visible
                bgImages.forEach((bg, bgIndex) => {
                    bg.style.opacity = bgIndex === index ? 1 : 0;
                });
                
                // Add active class to the content card
                contentCards[index].classList.add('active');
            } else {
                contentCards[index].classList.remove('active');
            }
        });
    }

    // Add scroll event listener
    window.addEventListener('scroll', checkScroll);
    
    // Check scroll on page load
    checkScroll();

    // For smooth scroll from intro to first section
    document.querySelector('.scroll-indicator').addEventListener('click', () => {
        window.scrollTo({
            top: window.innerHeight,
            behavior: 'smooth'
        });
    });
});