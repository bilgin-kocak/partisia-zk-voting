use create_type_spec_derive::CreateTypeSpec;
use pbc_zk::*;

#[allow(unused)]
const SALARY_VARIABLE_KIND: u8 = 0u8;

#[derive(CreateTypeSpec, SecretBinary)]
pub struct ZkInput{
    pub salary: Sbi32,
    /// the gender to input. The following values are allowed:
    /// 1 = Male
    /// 2 = Female
    /// 3 = Other
    pub gender_choice: Sbi8,
}

#[derive(SecretBinary)]
pub struct GenderedSumResult{
    pub salary_sums: ZkSalarySums,
    pub input_counts: ZkInputCounts,
}

#[derive(SecretBinary)]
pub struct ZkSalarySums{
    pub male_average: Sbi32,
    pub female_average: Sbi32,
    pub other_average: Sbi32,
}

#[derive(SecretBinary)]
pub struct ZkInputCounts {
    pub male_counts: Sbi32,
    pub female_counts: Sbi32,
    pub other_counts: Sbi32,
}

/// Perform a zk computation on secret-shared data sum the secret variables.
///
/// ### Returns:
///
/// The sum of the secret variables.
#[zk_compute(shortname = 0x61)]
pub fn sum_everything() -> GenderedSumResult {
    // Initialize state
    let mut sum_salaries: [Sbi32; 3] = [Sbi32::from(0); 3];
    let mut input_counts: [Sbi32; 3] = [Sbi32::from(0); 3];

    // Sum each variable
    for variable_id in secret_variable_ids() {
        if load_metadata::<u8>(variable_id) == SALARY_VARIABLE_KIND {
            let input = load_sbi::<ZkInput>(variable_id);
            for idx in 0usize..3usize {
                if input.gender_choice == Sbi8::from(idx as i8 + 1) {
                    sum_salaries[idx] = sum_salaries[idx] + input.salary;
                    input_counts[idx] = input_counts[idx] + Sbi32::from(1);
                }
            }
        }
    }

    GenderedSumResult{
        salary_sums: ZkSalarySums{
            male_average: sum_salaries[0],
            female_average: sum_salaries[1],
            other_average: sum_salaries[2],
        },
        input_counts: ZkInputCounts{
            male_counts: input_counts[0],
            female_counts: input_counts[1],
            other_counts: input_counts[2],
        }
    }
}
