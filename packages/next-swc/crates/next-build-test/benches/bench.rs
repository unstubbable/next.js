use std::time::Duration;

use anyhow::Context;
use criterion::{black_box, criterion_group, criterion_main, Criterion};
use next_api::project::{ProjectContainer, ProjectOptions};
use turbo_tasks::TurboTasks;
use turbo_tasks_malloc::TurboMalloc;
use turbopack_binding::turbo::tasks_memory::MemoryBackend;

#[global_allocator]
static ALLOC: turbo_tasks_malloc::TurboMalloc = turbo_tasks_malloc::TurboMalloc;

pub fn criterion_benchmark(c: &mut Criterion) {
    next_build_test::register();

    let mut file = std::fs::File::open("project_options.json")
        .with_context(|| {
            let path = std::env::current_dir()
                .unwrap()
                .join("project_options.json");
            format!("loading file at {}", path.display())
        })
        .unwrap();

    let data: ProjectOptions = serde_json::from_reader(&mut file).unwrap();

    let options = ProjectOptions { ..data };

    let rt = tokio::runtime::Builder::new_multi_thread()
        .enable_all()
        .on_thread_stop(|| {
            TurboMalloc::thread_stop();
        })
        .build()
        .unwrap();

    c.bench_function("entrypoints", |b| {
        b.to_async(&rt).iter(|| {
            let options = options.clone();
            async move {
                let tt = TurboTasks::new(MemoryBackend::new(usize::MAX));
                _ = tt
                    .run_once(async move {
                        let project = ProjectContainer::new(options.to_owned());
                        _ = black_box(project.entrypoints().await);
                        Ok(())
                    })
                    .await;
            }
        });
    });

    // decide the pages to benchmark ahead of time
    const SELECTED_PAGES: [&str; 10] = [
        "/legal/event-code-of-conduct",
        "/docs/functions/og-image-generation/og-image-api",
        "/docs/image-optimization/managing-image-optimization-costs",
        "/new/import/card",
        "/try/share/[slug]",
        "/app-future/[lang]/[teamSlug]/~/account/invoices-new",
        "/docs/workflow-collaboration/conformance/rules/NEXTJS_MISSING_REACT_STRICT_MODE",
        "/app-future/[lang]/[teamSlug]/~/ai/models/[modelName]/getting-started",
        "/app-future/[lang]/[teamSlug]/~/usage/[plan]/[planIteration]",
        "/docs/workflow-collaboration/conformance/rules/REQUIRE_CARET_DEPENDENCIES",
    ];

    c.bench_function("10 pages", |b| {
        b.to_async(&rt).iter(|| {
            let options = options.clone();
            async move {
                let tt = TurboTasks::new(MemoryBackend::new(usize::MAX));
                let result = tt
                    .run_once(async move {
                        let project = ProjectContainer::new(options.to_owned());
                        let entrypoints = project.entrypoints().await.unwrap();
                        let routes = entrypoints
                            .routes
                            .clone()
                            .into_iter()
                            .filter(|route| SELECTED_PAGES.contains(&route.0.as_str()));

                        next_build_test::render_routes(
                            routes,
                            next_build_test::Strategy::Concurrent,
                            10,
                            10,
                        )
                        .await;

                        Ok(())
                    })
                    .await;

                black_box(result).unwrap();
            }
        });
    });
}

criterion_group!(benches, criterion_benchmark);
criterion_main!(benches);
