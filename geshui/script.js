const TAX_BRACKETS = [
    { min: 0, max: 3000, rate: 0.03, quickDeduction: 0 },
    { min: 3000, max: 12000, rate: 0.10, quickDeduction: 210 },
    { min: 12000, max: 25000, rate: 0.20, quickDeduction: 1410 },
    { min: 25000, max: 35000, rate: 0.25, quickDeduction: 2660 },
    { min: 35000, max: 55000, rate: 0.30, quickDeduction: 4410 },
    { min: 55000, max: 80000, rate: 0.35, quickDeduction: 7160 },
    { min: 80000, max: Infinity, rate: 0.45, quickDeduction: 15160 }
];

const elements = {
    salary: document.getElementById('salary'),
    pensionRate: document.getElementById('pensionRate'),
    medicalRate: document.getElementById('medicalRate'),
    unemploymentRate: document.getElementById('unemploymentRate'),
    housingRate: document.getElementById('housingRate'),
    specialDeduction: document.getElementById('specialDeduction'),
    threshold: document.getElementById('threshold'),
    minimumWage: document.getElementById('minimumWage'),
    minimumWageGroup: document.getElementById('minimumWageGroup'),
    pensionValue: document.getElementById('pensionValue'),
    medicalValue: document.getElementById('medicalValue'),
    unemploymentValue: document.getElementById('unemploymentValue'),
    housingValue: document.getElementById('housingValue'),
    taxAmount: document.getElementById('taxAmount'),
    afterTaxSalary: document.getElementById('afterTaxSalary'),
    detailSalary: document.getElementById('detailSalary'),
    detailInsurance: document.getElementById('detailInsurance'),
    detailInsuranceBase: document.getElementById('detailInsuranceBase'),
    detailPension: document.getElementById('detailPension'),
    detailMedical: document.getElementById('detailMedical'),
    detailUnemployment: document.getElementById('detailUnemployment'),
    detailHousing: document.getElementById('detailHousing'),
    detailSpecial: document.getElementById('detailSpecial'),
    detailThreshold: document.getElementById('detailThreshold'),
    detailTaxable: document.getElementById('detailTaxable'),
    detailRate: document.getElementById('detailRate'),
    detailQuickDeduction: document.getElementById('detailQuickDeduction'),
    detailToggle: document.getElementById('detailToggle'),
    detailContent: document.getElementById('detailContent'),
    taxTableToggle: document.getElementById('taxTableToggle'),
    taxTableContent: document.getElementById('taxTableContent'),
    insuranceBaseRadios: document.querySelectorAll('input[name="insuranceBase"]')
};

function formatCurrency(amount) {
    return '¥' + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function getInsuranceBase() {
    const selectedBase = document.querySelector('input[name="insuranceBase"]:checked').value;
    const salary = parseFloat(elements.salary.value) || 0;
    const minimumWage = parseFloat(elements.minimumWage.value) || 0;
    
    return selectedBase === 'minimum' ? minimumWage : salary;
}

function toggleMinimumWageInput() {
    const selectedBase = document.querySelector('input[name="insuranceBase"]:checked').value;
    if (selectedBase === 'minimum') {
        elements.minimumWageGroup.style.display = 'block';
    } else {
        elements.minimumWageGroup.style.display = 'none';
    }
}

function calculateSocialInsurance(salary, rates) {
    const pension = salary * rates.pension / 100;
    const medical = salary * rates.medical / 100;
    const unemployment = salary * rates.unemployment / 100;
    const housing = salary * rates.housing / 100;
    const total = pension + medical + unemployment + housing;
    
    return {
        pension,
        medical,
        unemployment,
        housing,
        total
    };
}

function calculateTaxableIncome(salary, socialInsurance, threshold, specialDeduction) {
    const taxable = salary - socialInsurance - threshold - specialDeduction;
    return Math.max(0, taxable);
}

function findTaxBracket(taxableIncome) {
    for (let i = TAX_BRACKETS.length - 1; i >= 0; i--) {
        if (taxableIncome > TAX_BRACKETS[i].min) {
            return TAX_BRACKETS[i];
        }
    }
    return TAX_BRACKETS[0];
}

function calculatePersonalIncomeTax(taxableIncome) {
    if (taxableIncome <= 0) {
        return {
            tax: 0,
            rate: 0,
            quickDeduction: 0
        };
    }
    
    const bracket = findTaxBracket(taxableIncome);
    const tax = taxableIncome * bracket.rate - bracket.quickDeduction;
    
    return {
        tax: Math.max(0, tax),
        rate: bracket.rate * 100,
        quickDeduction: bracket.quickDeduction
    };
}

function animateValue(element, start, end, duration = 400) {
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const current = start + (end - start) * easeProgress;
        element.textContent = formatCurrency(current);
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

let previousTax = 0;
let previousAfterTax = 0;

function updateCalculation() {
    const salary = parseFloat(elements.salary.value) || 0;
    const pensionRate = parseFloat(elements.pensionRate.value) || 0;
    const medicalRate = parseFloat(elements.medicalRate.value) || 0;
    const unemploymentRate = parseFloat(elements.unemploymentRate.value) || 0;
    const housingRate = parseFloat(elements.housingRate.value) || 0;
    const specialDeduction = parseFloat(elements.specialDeduction.value) || 0;
    const threshold = parseFloat(elements.threshold.value) || 0;
    const insuranceBase = getInsuranceBase();

    elements.pensionValue.textContent = pensionRate + '%';
    elements.medicalValue.textContent = medicalRate + '%';
    elements.unemploymentValue.textContent = unemploymentRate + '%';
    elements.housingValue.textContent = housingRate + '%';

    const insurance = calculateSocialInsurance(insuranceBase, {
        pension: pensionRate,
        medical: medicalRate,
        unemployment: unemploymentRate,
        housing: housingRate
    });

    const taxableIncome = calculateTaxableIncome(salary, insurance.total, threshold, specialDeduction);
    const taxResult = calculatePersonalIncomeTax(taxableIncome);
    const afterTaxSalary = salary - insurance.total - taxResult.tax;

    animateValue(elements.taxAmount, previousTax, taxResult.tax);
    animateValue(elements.afterTaxSalary, previousAfterTax, afterTaxSalary);
    
    previousTax = taxResult.tax;
    previousAfterTax = afterTaxSalary;

    elements.detailSalary.textContent = formatCurrency(salary);
    elements.detailInsurance.textContent = formatCurrency(insurance.total);
    elements.detailInsuranceBase.textContent = formatCurrency(insuranceBase);
    elements.detailPension.textContent = formatCurrency(insurance.pension);
    elements.detailMedical.textContent = formatCurrency(insurance.medical);
    elements.detailUnemployment.textContent = formatCurrency(insurance.unemployment);
    elements.detailHousing.textContent = formatCurrency(insurance.housing);
    elements.detailSpecial.textContent = formatCurrency(specialDeduction);
    elements.detailThreshold.textContent = formatCurrency(threshold);
    elements.detailTaxable.textContent = formatCurrency(taxableIncome);
    elements.detailRate.textContent = taxResult.rate + '%';
    elements.detailQuickDeduction.textContent = formatCurrency(taxResult.quickDeduction);
}

function setupEventListeners() {
    const inputElements = [
        elements.salary,
        elements.pensionRate,
        elements.medicalRate,
        elements.unemploymentRate,
        elements.housingRate,
        elements.specialDeduction,
        elements.threshold,
        elements.minimumWage
    ];

    inputElements.forEach(el => {
        el.addEventListener('input', updateCalculation);
        el.addEventListener('change', updateCalculation);
    });

    elements.insuranceBaseRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            toggleMinimumWageInput();
            updateCalculation();
        });
    });

    elements.detailToggle.addEventListener('click', () => {
        elements.detailToggle.classList.toggle('active');
        elements.detailContent.classList.toggle('show');
    });

    elements.taxTableToggle.addEventListener('click', () => {
        elements.taxTableToggle.classList.toggle('active');
        elements.taxTableContent.classList.toggle('show');
    });

    document.querySelectorAll('.input-field').forEach(input => {
        input.addEventListener('wheel', (e) => {
            e.preventDefault();
        });
    });
}

function init() {
    setupEventListeners();
    toggleMinimumWageInput();
    updateCalculation();
}

document.addEventListener('DOMContentLoaded', init);
