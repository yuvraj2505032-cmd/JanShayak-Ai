import React, { useState } from 'react';
import { Language, Scheme } from '../types/scheme';
import { TRANSLATIONS } from '../data/translations';
import { GOV_SCHEMES } from '../data/schemes';
import {
  INDIA_STATES_AND_UTS,
  ALL_STATES_SCHEMES_POOL,
  getDistrictsForState,
  getStateMetadata,
} from '../data/indiaStatesAndDistricts';
import {
  MapPin,
  Building2,
  PhoneCall,
  Search,
  ExternalLink,
  Sparkles,
  ArrowRight,
  Globe,
} from 'lucide-react';

interface DistrictPortalFinderProps {
  currentLang: Language;
  selectedStateName?: string;
  onSelectState?: (stateName: string) => void;
  selectedDistrictName: string;
  onSelectDistrict: (districtName: string) => void;
  onOpenSchemeModal: (scheme: Scheme) => void;
  allSchemes?: Scheme[];
}

export const DistrictPortalFinder: React.FC<DistrictPortalFinderProps> = ({
  currentLang,
  selectedStateName = 'Punjab',
  onSelectState,
  selectedDistrictName,
  onSelectDistrict,
  onOpenSchemeModal,
  allSchemes = GOV_SCHEMES,
}) => {
  const t = TRANSLATIONS[currentLang];
  const [activeStateName, setActiveStateName] = useState<string>(selectedStateName || 'Punjab');
  const [districtSearch, setDistrictSearch] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [nearbyKendraMapUrl, setNearbyKendraMapUrl] = useState('');

  const stateMeta = getStateMetadata(activeStateName);
  const stateDistricts = getDistrictsForState(stateMeta.name);
  const activeDistrict =
    stateDistricts.find((d) => d.name === selectedDistrictName) || stateDistricts[0];

  const combinedSchemes: Scheme[] = [
    ...allSchemes,
    ...ALL_STATES_SCHEMES_POOL.map((b) => b.scheme).filter(
      (s) => !allSchemes.some((existing) => existing.id === s.id)
    ),
  ];

  const handleStateSwitch = (nextState: string) => {
    setActiveStateName(nextState);
    onSelectState?.(nextState);
    const nextDistricts = getDistrictsForState(nextState);
    if (nextDistricts[0]) {
      onSelectDistrict(nextDistricts[0].name);
    }
  };

  const handleUseMyLocation = () => {
    setLocationError('');
    setNearbyKendraMapUrl('');
    if (!navigator.geolocation) {
      setLocationError(t.locationUnsupported);
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const query = encodeURIComponent(
          `${stateMeta.sewaPortalName.split('(')[0].trim()} near ${coords.latitude},${coords.longitude}`
        );
        setNearbyKendraMapUrl(`https://www.google.com/maps/search/?api=1&query=${query}`);
        setIsLocating(false);
      },
      (error) => {
        setLocationError(
          error.code === error.PERMISSION_DENIED
            ? t.locationPermissionDenied
            : error.code === error.TIMEOUT
            ? t.locationTimeout
            : t.locationUnavailable
        );
        setIsLocating(false);
      },
      { enableHighAccuracy: false, maximumAge: 60_000, timeout: 10_000 }
    );
  };

  const filteredDistricts = stateDistricts.filter(
    (d) =>
      d.name.toLowerCase().includes(districtSearch.toLowerCase()) ||
      d.namePa.includes(districtSearch) ||
      d.nameHi.includes(districtSearch)
  );

  const totalAllIndiaDistricts = INDIA_STATES_AND_UTS.reduce(
    (sum, st) => sum + st.districts.length,
    0
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 bg-linear-to-r bg-gradient-to-r from-teal-900 via-blue-900 to-indigo-900 text-white rounded-2xl p-6 shadow-md">
        <div className="inline-flex items-center gap-1.5 bg-teal-500/20 text-teal-300 text-xs font-bold px-3 py-1 rounded-full border border-teal-400/30 mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>
            All-India 36 States &amp; UTs • {totalAllIndiaDistricts}+ Districts Directory
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
          {currentLang === 'pa'
            ? 'ਸਾਰੇ ਭਾਰਤੀ ਰਾਜ ਅਤੇ ਜ਼ਿਲ੍ਹਾ ਸੇਵਾ ਕੇਂਦਰ ਡਾਇਰੈਕਟਰੀ'
            : currentLang === 'hi'
            ? 'अखिल भारतीय राज्य एवं जिला सेवा केंद्र निर्देशिका'
            : 'All-India States & District e-Seva Kendra Directory'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-3xl mt-1">
          {currentLang === 'pa'
            ? 'ਭਾਰਤ ਦੇ ਸਾਰੇ 28 ਰਾਜਾਂ ਅਤੇ 8 ਕੇਂਦਰ ਸ਼ਾਸਤ ਪ੍ਰਦੇਸ਼ਾਂ ਦੇ ਜ਼ਿਲ੍ਹਾ ਸੇਵਾ ਕੇਂਦਰ (Sewa Kendra / CSC / e-District), ਹੈਲਪਲਾਈਨ ਨੰਬਰ ਅਤੇ ਰਾਜ ਸਕੀਮਾਂ ਲੱਭੋ।'
            : currentLang === 'hi'
            ? 'भारत के सभी 28 राज्यों और 8 केंद्र शासित प्रदेशों के जिला सेवा केंद्र (Sewa Kendra / CSC / e-District), हेल्पलाइन नंबर और राज्य योजनाएं खोजें।'
            : 'Locate Sewa Kendras, e-District CSCs, Collectorate helplines, and state welfare schemes across all 28 Indian States and 8 Union Territories.'}
        </p>

        {/* State Selector + District Quick Search Bar */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
          <div>
            <label
              htmlFor="directory-state-select"
              className="block text-[11px] font-bold text-teal-200 uppercase tracking-wider mb-1"
            >
              {currentLang === 'pa'
                ? 'ਰਾਜ / ਯੂ.ਟੀ ਚੁਣੋ (36 States/UTs)'
                : currentLang === 'hi'
                ? 'राज्य / यूटी चुनें (36 States/UTs)'
                : 'Select State / Union Territory (36)'}
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 text-blue-700 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                id="directory-state-select"
                data-testid="directory-state-select"
                value={stateMeta.name}
                onChange={(e) => handleStateSwitch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-white text-slate-900 rounded-xl font-bold focus:outline-hidden cursor-pointer"
              >
                {INDIA_STATES_AND_UTS.map((st) => (
                  <option key={st.code} value={st.name}>
                    {st.name} ({currentLang === 'pa' ? st.namePa : currentLang === 'hi' ? st.nameHi : st.code}) — {st.districts.length} Districts
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="directory-district-search"
              className="block text-[11px] font-bold text-teal-200 uppercase tracking-wider mb-1"
            >
              {currentLang === 'pa'
                ? `${stateMeta.namePa} ਵਿੱਚ ਜ਼ਿਲ੍ਹਾ ਖੋਜੋ`
                : currentLang === 'hi'
                ? `${stateMeta.nameHi} में जिला खोजें`
                : `Search District in ${stateMeta.name}`}
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="directory-district-search"
                type="text"
                value={districtSearch}
                onChange={(e) => setDistrictSearch(e.target.value)}
                placeholder={`Search ${stateMeta.name} districts (${stateMeta.districts.slice(0, 3).join(', ')})...`}
                className="w-full pl-9 pr-3 py-2 text-xs bg-white text-slate-900 rounded-xl focus:outline-hidden font-medium"
              />
            </div>
          </div>
        </div>

        {/* Quick State Switcher Pills */}
        <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
          {[
            'Punjab',
            'Haryana',
            'Himachal Pradesh',
            'Delhi',
            'Uttar Pradesh',
            'Rajasthan',
            'Maharashtra',
            'Madhya Pradesh',
            'Gujarat',
            'Bihar',
            'West Bengal',
            'Karnataka',
            'Tamil Nadu',
            'Telangana',
            'Kerala',
          ].map((stName) => {
            const isSelected = stateMeta.name === stName;
            return (
              <button
                key={stName}
                type="button"
                onClick={() => handleStateSwitch(stName)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition cursor-pointer ${
                  isSelected
                    ? 'bg-teal-400 text-slate-950 shadow-xs'
                    : 'bg-white/10 text-slate-200 hover:bg-white/20'
                }`}
              >
                {stName}
              </button>
            );
          })}
        </div>

        <div className="mt-3.5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleUseMyLocation}
            disabled={isLocating}
            className="inline-flex min-h-9 items-center gap-2 rounded-xl bg-teal-500 px-4 py-1.5 text-xs font-bold text-slate-950 transition hover:bg-teal-400 disabled:cursor-wait disabled:opacity-60 cursor-pointer"
          >
            <MapPin className="h-4 w-4" aria-hidden="true" />
            {isLocating ? t.locating : t.useMyLocation}
          </button>
          <a
            href={stateMeta.officialPortalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl bg-white/15 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-white/25"
          >
            <span>
              Official {stateMeta.name} Portal ({new URL(stateMeta.officialPortalUrl).hostname})
            </span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
          {nearbyKendraMapUrl && (
            <a
              href={nearbyKendraMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-200 underline underline-offset-2 hover:text-white"
            >
              {t.viewNearbySewaKendras}
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          )}
        </div>
        {locationError && (
          <p role="alert" className="mt-2 text-xs font-medium text-rose-200">
            {locationError}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* District List Selector */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs max-h-[550px] overflow-y-auto space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2 px-2">
            {stateMeta.name} Districts ({filteredDistricts.length})
          </span>
          {filteredDistricts.map((district) => {
            const isSelected = district.name === activeDistrict.name;
            const displayName =
              currentLang === 'pa'
                ? district.namePa
                : currentLang === 'hi'
                ? district.nameHi
                : district.name;

            return (
              <button
                key={district.name}
                type="button"
                onClick={() => onSelectDistrict(district.name)}
                className={`w-full p-2.5 rounded-xl text-left text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <MapPin
                    className={`w-3.5 h-3.5 ${isSelected ? 'text-teal-300' : 'text-slate-400'}`}
                  />
                  <span>{displayName}</span>
                </div>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                    isSelected ? 'bg-blue-800 text-teal-200' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {district.sewaKendraCount} Kendras
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected District Details & Key Local Contacts */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200 uppercase tracking-wider">
                  {stateMeta.name} ({stateMeta.type}) • Capital: {stateMeta.capital}
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-1">
                  District {activeDistrict.name}, {stateMeta.name}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  District Headquarters: {activeDistrict.headquarters} • Citizen Portal:{' '}
                  {stateMeta.sewaPortalName}
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 text-blue-900 px-3.5 py-2 rounded-xl text-center">
                <div className="text-lg font-black text-blue-800">
                  {activeDistrict.sewaKendraCount}
                </div>
                <div className="text-[10px] font-bold text-blue-600 uppercase">
                  Operational e-Seva / CSC Kendras
                </div>
              </div>
            </div>

            {/* Address & Helpline Callout Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Main Collectorate / e-Seva Kendra</span>
                </span>
                <p className="text-xs font-semibold text-slate-800 leading-snug">
                  {activeDistrict.mainSewaKendraAddress}
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                  <PhoneCall className="w-3.5 h-3.5 text-teal-600" />
                  <span>DC Office &amp; State Grievance Helplines</span>
                </span>
                <p className="text-xs font-bold text-slate-900">
                  DC / Collector Office:{' '}
                  <a
                    href={`tel:${activeDistrict.dcOfficeContact}`}
                    className="text-blue-700 hover:underline"
                  >
                    {activeDistrict.dcOfficeContact}
                  </a>
                </p>
                <p className="text-xs font-bold text-teal-800 mt-0.5">
                  State Helpline:{' '}
                  <a
                    href={`tel:${activeDistrict.helpline.split('/')[0].trim()}`}
                    className="text-teal-700 underline"
                  >
                    {activeDistrict.helpline} (Toll-Free)
                  </a>
                </p>
              </div>
            </div>

            {/* Popular / High-Impact Schemes in this District & State */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">
                Key State &amp; Central Schemes Actively Disbursed in {activeDistrict.name},{' '}
                {stateMeta.name}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {activeDistrict.popularSchemes.map((schemeId) => {
                  const scheme = combinedSchemes.find((s) => s.id === schemeId);
                  if (!scheme) return null;
                  const schemeTitle =
                    currentLang === 'pa'
                      ? scheme.titlePa
                      : currentLang === 'hi'
                      ? scheme.titleHi
                      : scheme.titleEn;

                  return (
                    <div
                      key={scheme.id}
                      onClick={() => onOpenSchemeModal(scheme)}
                      className="p-3 bg-white hover:bg-blue-50/50 rounded-xl border border-slate-200 hover:border-blue-300 cursor-pointer shadow-xs transition-all flex items-center justify-between gap-2 group"
                    >
                      <div>
                        <div className="font-bold text-xs text-slate-900 group-hover:text-blue-700">
                          {schemeTitle}
                        </div>
                        <div className="text-[10px] text-teal-700 font-semibold mt-0.5">
                          {scheme.benefitAmountText}
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-transform shrink-0" />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
