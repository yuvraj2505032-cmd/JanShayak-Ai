import React, { useState } from 'react';
import { ExternalLink, Play, Youtube } from 'lucide-react';
import { getSchemeYoutubeBundle } from '../data/schemeVideos';

interface SchemeVideoTutorialsProps {
  schemeName: string;
  schemeId?: string;
  youtubeVideoId?: string;
  youtubeVideoTitle?: string;
}

export const SchemeVideoTutorials: React.FC<SchemeVideoTutorialsProps> = ({
  schemeName,
  schemeId,
  youtubeVideoId,
  youtubeVideoTitle,
}) => {
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const bundle = getSchemeYoutubeBundle({
    id: schemeId ?? '',
    titleEn: schemeName,
    youtubeVideoId,
    youtubeVideoTitle,
  });

  const tutorialLabels = [
    'Step 1: Online Registration & Portal Apply Guide',
    'Step 2: Eligibility Criteria & Document Upload Walkthrough',
    'Step 3: Status Check, e-KYC & Bank DBT Verification',
  ];

  return (
    <section
      className="space-y-4 border-t border-slate-200 pt-5"
      aria-labelledby="scheme-video-tutorials-title"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 id="scheme-video-tutorials-title" className="text-sm font-bold text-slate-900">
            Scheme-Specific YouTube Video Tutorials ({bundle.videoIds.length} Videos)
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Watch verified step-by-step application tutorials or open directly on YouTube.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href={bundle.watchOnYoutubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-rose-700"
          >
            <Youtube className="h-3.5 w-3.5" />
            <span>Watch on YouTube</span>
            <ExternalLink className="h-3 w-3" />
          </a>
          <a
            href={bundle.punjabiSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
          >
            <span>ਪੰਜਾਬੀ ਵੀਡੀਓ (Punjabi)</span>
            <ExternalLink className="h-3 w-3" />
          </a>
          <a
            href={bundle.hindiSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
          >
            <span>हिंदी वीडियो (Hindi)</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {bundle.videoIds.map((videoId, index) => {
          const isPlaying = playingVideoId === videoId;
          const title =
            index === 0 && youtubeVideoTitle
              ? youtubeVideoTitle
              : `${schemeName} — ${tutorialLabels[index] || `Application Tutorial ${index + 1}`}`;
          const directWatchUrl = `https://www.youtube.com/watch?v=${videoId}`;

          return (
            <article
              key={`${schemeId}-${videoId}`}
              className="flex min-w-0 flex-col justify-between overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
            >
              <div>
                <div className="relative aspect-video bg-slate-900">
                  {isPlaying ? (
                    <iframe
                      className="absolute inset-0 h-full w-full"
                      src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
                      title={title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setPlayingVideoId(videoId)}
                      aria-label={`Play ${title}`}
                      className="group absolute inset-0 flex h-full w-full items-center justify-center bg-slate-900"
                    >
                      <img
                        src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                        alt={title}
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover opacity-85 transition group-hover:opacity-70"
                      />
                      <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-rose-600 text-white shadow-lg transition group-hover:scale-105">
                        <Play className="ml-0.5 h-5 w-5 fill-current" />
                      </span>
                    </button>
                  )}
                </div>
                <div className="flex items-start gap-2.5 p-3">
                  <Youtube className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                  <h4 className="text-xs font-semibold leading-relaxed text-slate-800">{title}</h4>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/70 px-3 py-2">
                <button
                  type="button"
                  onClick={() => setPlayingVideoId(videoId)}
                  className="text-[11px] font-bold text-teal-700 hover:underline"
                >
                  {isPlaying ? 'Playing in App' : 'Play Video Here'}
                </button>
                <a
                  href={directWatchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:underline"
                >
                  <span>Open YouTube Link</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};
