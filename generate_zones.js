const lgas = ['Agege', 'Ajeromi-Ifelodun', 'Alimosho', 'Amuwo-Odofin', 'Apapa', 'Badagry', 'Epe', 'Eti-Osa', 'Ibeju-Lekki', 'Ifako-Ijaiye', 'Ikeja', 'Ikorodu', 'Kosofe', 'Lagos Island', 'Lagos Mainland', 'Mushin', 'Ojo', 'Oshodi-Isolo', 'Shomolu', 'Surulere'];

const getDeliveryFee = (selectedLga) => {
    switch (selectedLga) {
      case 'Eti-Osa': return 7000;
      case 'Oshodi-Isolo': return 4000;
      case 'Shomolu': return 3500;
      case 'Badagry': return 6000;
      case 'Alimosho': return 3000;
      case 'Mushin': return 3000;
      default: return 5000;
    }
};

const zones = lgas.map(lga => ({
    zone: lga,
    state: 'Lagos State',
    time: 'Standard Delivery',
    fee: getDeliveryFee(lga)
}));
console.log(JSON.stringify(zones, null, 2));
